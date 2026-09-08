import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { NextResponse } from 'next/server';
import { MODEL_BY_ID, MODEL_METRICS } from '@/lib/capital-model';

export const runtime = 'nodejs';

/**
 * Server-side Gemini call for the "Why is this highlighted?" feature.
 *
 * PRD section 7: the model receives ONLY the row's computed numeric sub-scores
 * and must reference at least two of them. It never sees the raw datasets, so
 * it cannot invent figures. If every model in the chain fails, the route
 * returns 502 and the client falls back to its templated explanation.
 *
 * The grounding payload also carries the trained expected-credit benchmark's
 * output for this cell, so the narration describes an actual model result
 * rather than restating the hand-weighted heuristic.
 */

const SYSTEM_RULES = `You are a credit analyst writing for a regional bank's investment committee.
You will be given the computed scores for ONE province-sector cell of the Capital X-Ray model.

Rules you must follow exactly:
- Use ONLY the numbers provided. Never invent or estimate any other figure.
- Reference at least TWO of the provided sub-scores explicitly, with their values.
- capitalGapScore is NEGATIVE when the sector is UNDERFINANCED (economic activity
  outpaces credit) and POSITIVE when it is OVERFINANCED (credit outpaces activity).
- All *Score and sub-score values are 0-100 indices normalised across the 15 cells.
- Values ending in Pct are real compound annual growth rates in percent, 2015-2020.
- Be concise and concrete. No hedging, no filler, no invented causes.
- Write in English.

About the "mlBenchmark" block, if present:
- It is a supervised regression trained on the 90-row province x sector x year panel,
  predicting log(loans) from log(turnover), log(businesses), sector and a year trend.
- creditGapPct is actual lending minus model-expected lending, in percent. NEGATIVE
  means the cell receives LESS credit than peer cells with the same fundamentals.
- zScore standardises that gap against the spread across all 15 cells.
- In modelInsight, state the expected-vs-actual lending comparison in euros and cite
  creditGapPct. Say plainly that this is a peer benchmark: it shows the cell is lent
  less (or more) than statistically similar cells. Never claim it proves the cell
  deserves more credit, and never claim causality.
- The heuristic capitalGapScore and the mlBenchmark measure different things and can
  disagree. If they disagree, say so in one clause rather than hiding it.`;

const schema = {
  type: Type.OBJECT,
  properties: {
    headline: { type: Type.STRING, description: 'Under 70 characters.' },
    verdict: {
      type: Type.STRING,
      enum: ['DEFICIT_UNDERFINANCED', 'BALANCED_STABLE', 'SURPLUS_OVERHEATED'],
    },
    narrative: { type: Type.STRING, description: 'Two sentences, citing at least two sub-scores.' },
    driverPoints: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Exactly 3 bullets, each citing a specific number.',
    },
    recommendation: { type: Type.STRING, description: 'One actionable sentence.' },
    modelInsight: {
      type: Type.STRING,
      description:
        'One or two sentences on the ML benchmark: expected vs actual lending in euros, '
        + 'citing creditGapPct, framed as a peer comparison rather than a lending verdict.',
    },
  },
  required: [
    'headline',
    'verdict',
    'narrative',
    'driverPoints',
    'recommendation',
    'modelInsight',
  ],
};

// Tried in order, so a capacity spike or quota wall on one model never
// surfaces as a demo failure. Ordering reflects observed health: 3.7-flash
// sits last because its free-tier quota is the first to run out.
const MODEL_CHAIN = [
  'gemini-3.6-flash',
  'gemini-flash-latest',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.7-flash',
];

// Free-tier quota is per-model, so one exhausted model must not slow every
// later request down. A model that returns 429 is skipped for the next 10
// minutes; if every model is cooling down we ignore the cooldown and try
// anyway rather than give up.
const QUOTA_COOLDOWN_MS = 10 * 60 * 1000;
const cooldownUntil = new Map<string, number>();

// 500/503 are transient capacity blips and worth a second attempt.
// 429 is a quota wall - retrying the same model just burns demo time.
const OVERLOADED = /\b(500|502|503|504|UNAVAILABLE|INTERNAL)\b/;
const QUOTA = /\b(429|RESOURCE_EXHAUSTED)\b/;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function generate(ai: GoogleGenAI, model: string, prompt: string) {
  const result = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: schema,
      temperature: 0.4,
      // The grounding payload is small and the output shape is fixed, so deep
      // reasoning buys nothing here and roughly halves the wait on stage.
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
    },
  });
  const text = result.text;
  if (!text) throw new Error('empty response');
  const payload = JSON.parse(text);
  if (!Array.isArray(payload.driverPoints)) throw new Error('bad shape');
  return payload;
}

async function generateWithFallback(ai: GoogleGenAI, prompt: string) {
  let lastErr: unknown = null;
  const now = Date.now();

  const ready = MODEL_CHAIN.filter((m) => (cooldownUntil.get(m) ?? 0) <= now);
  const order = ready.length > 0 ? ready : MODEL_CHAIN;

  for (const model of order) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const payload = await generate(ai, model, prompt);
        return { payload, model };
      } catch (err) {
        lastErr = err;
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[api/explain] ${model} attempt ${attempt + 1} failed: ${msg.slice(0, 160)}`);

        if (QUOTA.test(msg)) {
          cooldownUntil.set(model, Date.now() + QUOTA_COOLDOWN_MS);
          break; // out of quota - move on, retrying cannot help
        }
        // Anything not a capacity blip (bad model id, auth, schema) - next model.
        if (!OVERLOADED.test(msg)) break;
        if (attempt === 0) await sleep(700);
      }
    }
  }

  throw lastErr ?? new Error('all models failed');
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 503 });
  }

  try {
    const row = await req.json();

    // Only the computed numbers travel to the model. The ML benchmark output is
    // looked up server-side by cell id so the client payload stays unchanged.
    const benchmark = MODEL_BY_ID[row.id as string];
    const grounding = {
      province: row.province,
      sector: row.sector,
      economicMomentum: row.economicMomentum,
      financingSupport: row.financingSupport,
      capitalGapScore: row.capitalGapScore,
      subScores: row.subScores,
      actuals: row.raw ?? null,
      mlBenchmark: benchmark
        ? {
            expectedLoansKEUR: benchmark.expectedLoansKEUR,
            actualLoansKEUR: benchmark.actualLoansKEUR,
            creditGapPct: benchmark.creditGapPct,
            zScore: benchmark.zScore,
            verdict: benchmark.verdict,
            modelLeaveOneCellOutR2: MODEL_METRICS.leaveOneCellOutR2,
            modelTypicalErrorPct: MODEL_METRICS.typicalErrorPct,
          }
        : null,
    };

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `${SYSTEM_RULES}\n\nCell data:\n${JSON.stringify(grounding, null, 2)}`;
    const { payload, model } = await generateWithFallback(ai, prompt);

    return NextResponse.json({ ...payload, source: 'gemini', model });
  } catch (err) {
    console.error('[api/explain]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'unknown' },
      { status: 502 },
    );
  }
}
