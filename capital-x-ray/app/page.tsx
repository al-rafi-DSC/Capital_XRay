'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart2,
  Brain,
  CheckCircle2,
  ChevronRight,
  Coins,
  Compass,
  Cpu,
  Database,
  Filter,
  Flame,
  Info,
  Layers,
  MapPin,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { CAPITAL_DATA } from '@/lib/capital-data';
import {
  MODEL_BY_ID,
  MODEL_CELLS,
  MODEL_COEFFICIENTS,
  MODEL_META,
  MODEL_METRICS,
} from '@/lib/capital-model';

// Widest learned gap in the set: the diverging bars scale against this so the
// largest deviation fills its half of the track.
const MODEL_GAP_SCALE = Math.max(...MODEL_CELLS.map((c) => Math.abs(c.creditGapPct)));

/* ==========================================================================
   DATA SHAPE & MOCK DATA (Lombardy Provinces × Key Business Sectors)
   All data lives in this array for trivial swapping with live API endpoints.
   ========================================================================== */

interface SubScores {
  turnoverGrowth: number;
  businessGrowth: number;
  sectorPerformance: number;
  creditGrowth: number;
  depositStrength: number;
  liquidity: number;
}

interface CapitalXRayRow {
  id: string;
  province: 'Milano' | 'Bergamo' | 'Brescia' | 'Monza e della Brianza' | 'Varese';
  sector: 'Industria' | 'Costruzioni' | 'Servizi';
  economicMomentum: number; // 0-100
  financingSupport: number; // 0-100
  capitalGapScore: number;  // financingSupport - economicMomentum (negative = financing deficit)
  subScores: SubScores;
  raw?: Record<string, number>;
  series?: { year: string; turnover_kEUR: number; loans_kEUR: number; businesses: number }[];
}

// Real pipeline output. Regenerate with: python pipeline/build_dataset.py
const MOCK_CAPITAL_DATA: CapitalXRayRow[] = CAPITAL_DATA as CapitalXRayRow[];

/* ==========================================================================
   AI EXPLANATION SERVICE
   Structured function to isolate synthetic AI explanations keyed to rowId.
   Teammates can swap the internals for a live Gemini/FastAPI call.
   ========================================================================== */

interface AiExplanationPayload {
  headline: string;
  verdict: 'DEFICIT_UNDERFINANCED' | 'BALANCED_STABLE' | 'SURPLUS_OVERHEATED';
  narrative: string;
  driverPoints: string[];
  recommendation: string;
  /** Narration of the expected-credit benchmark. Optional: the static demo
   *  entries predate the model, and Gemini may be unreachable. */
  modelInsight?: string;
}

const STATIC_EXPLANATIONS: Record<string, AiExplanationPayload> = {
  'milano-industria': {
    headline: 'High Industrial Momentum Stifled by Restrictive Lending Protocols',
    verdict: 'DEFICIT_UNDERFINANCED',
    narrative:
      'This sector shows strong turnover growth (82) and business growth (75), but credit growth is only 34 — a 41-point gap suggesting financing hasn\'t kept pace with real economic activity.',
    driverPoints: [
      'Sector performance registers in the top 10th percentile across Lombardy (88/100).',
      'Banking institutions are treating advanced manufacturing under legacy risk categories, restricting capex loans.',
      'Deposit strength is moderately resilient (62/100), proving healthy balance sheets despite credit drought.',
    ],
    recommendation:
      'Deploy targeted mezzanine debt or specialized asset-backed facilities to capture high ROI expansions before liquidity dries up.',
  },
  'bergamo-costruzioni': {
    headline: 'Critical Capital Deficit in Infrastructure & Green Retrofit Projects',
    verdict: 'DEFICIT_UNDERFINANCED',
    narrative:
      'Turnover growth reached 80 with overall performance at 82, yet bank credit growth stagnates at an anemic 28. The 46-point negative gap exposes an acute supply deficit for commercial construction.',
    driverPoints: [
      'Severe tightening by regional cooperative banks following nationwide fiscal incentive shifts.',
      'Liquidity reserves have fallen to 35/100 as contractors self-fund working capital.',
      'Project backlogs remain at multi-year peaks across the Bergamo-Brescia industrial corridor.',
    ],
    recommendation:
      'Institutional private debt and invoice discounting syndications represent high-demand, high-margin entry points.',
  },
  'como-alloggio': {
    headline: 'Tourism Boom Outrunning Traditional Hospitality Credit Limits',
    verdict: 'DEFICIT_UNDERFINANCED',
    narrative:
      'Lake Como hospitality demonstrates stellar turnover growth (86) and business momentum (79), but credit access remains capped at 46 — generating an acute 38-point capital gap during peak investment cycles.',
    driverPoints: [
      'Global luxury travel demand has elevated revenue per room, yet seasonal lending criteria constrain hotel renovations.',
      'Liquidity buffers sit at 48/100 as operators reinvest retained earnings into premium upgrades.',
      'Alternative debt and revenue-share financing remain almost completely untapped in this territory.',
    ],
    recommendation:
      'Direct asset-backed real estate credit or revenue-linked debt facilities could unlock substantial yield premiums.',
  },
  'milano-commercio': {
    headline: 'Overheated Credit Allocation Amid Decelerating Retail Margins',
    verdict: 'SURPLUS_OVERHEATED',
    narrative:
      'Commercial credit growth remains aggressively elevated at 78 despite turnover growth sagging to 46 and sector performance idling at 50 — generating a 28-point surplus that signals potential over-leverage.',
    driverPoints: [
      'Historical relationship banking has sustained high revolving lines even as brick-and-mortar footfall wanes.',
      'Business creation has stalled (49/100) while consumer e-commerce substitution accelerates.',
      'High bank liquidity exposure here diverts essential dry powder away from high-growth industrial clusters.',
    ],
    recommendation:
      'Prudent lenders should tighten refinancing covenants and reallocate excess capital allowances toward regional manufacturers.',
  },
};

/** Templated version of what the model section says, for when Gemini is down. */
function benchmarkSentence(rowId: string): string | undefined {
  const m = MODEL_BY_ID[rowId];
  if (!m) return undefined;
  const expected = Math.round(m.expectedLoansKEUR / 1000).toLocaleString('de-DE');
  const actual = Math.round(m.actualLoansKEUR / 1000).toLocaleString('de-DE');
  const direction = m.creditGapPct < 0 ? 'below' : 'above';
  return (
    `The expected-credit benchmark predicts €${expected}M of lending for this cell and observes ` +
    `€${actual}M, putting it ${Math.abs(m.creditGapPct).toFixed(1)}% ${direction} the level of peer ` +
    `cells with the same turnover, business count and sector (z = ${m.zScore.toFixed(2)}). ` +
    `That is a peer comparison, not a judgement on creditworthiness.`
  );
}

function getExplanation(row: CapitalXRayRow): AiExplanationPayload {
  // STATIC_EXPLANATIONS is demo-fallback only; real rows use live numbers below.
  // Graceful fallback for any row using exact live numbers
  const isDeficit = row.capitalGapScore <= -15;
  const isSurplus = row.capitalGapScore >= 15;
  const gapAbs = Math.abs(row.capitalGapScore);
  const modelInsight = benchmarkSentence(row.id);

  if (isDeficit) {
    return {
      headline: `Severe Capital Gap in ${row.province} ${row.sector}`,
      verdict: 'DEFICIT_UNDERFINANCED',
      narrative: `This sector shows robust turnover growth (${row.subScores.turnoverGrowth}) and business growth (${row.subScores.businessGrowth}), but credit growth is restricted to ${row.subScores.creditGrowth} — generating a ${gapAbs}-point capital deficit that restricts regional capacity.`,
      driverPoints: [
        `Economic momentum is commanding at ${row.economicMomentum}/100 while institutional financing lags at ${row.financingSupport}/100.`,
        `Liquidity metric stands at ${row.subScores.liquidity}/100, indicating firms are self-financing without institutional credit leverage.`,
        `Strong regional demand fundamentals are currently unmet by traditional banking syndicate channels.`,
      ],
      recommendation: `Prime candidate for debt fund origination or direct alternative lending partnerships.`,
      modelInsight,
    };
  } else if (isSurplus) {
    return {
      headline: `Excess Credit Saturation in ${row.province} ${row.sector}`,
      verdict: 'SURPLUS_OVERHEATED',
      narrative: `Financing support reaches ${row.financingSupport}/100 with credit growth at ${row.subScores.creditGrowth}, despite economic momentum settling at ${row.economicMomentum}/100. The ${gapAbs}-point surplus indicates potential misallocation.`,
      driverPoints: [
        `Credit supply exceeds observable organic business growth (${row.subScores.businessGrowth}/100).`,
        `Deposit strength sits at ${row.subScores.depositStrength}/100 with ample liquidity coverage (${row.subScores.liquidity}/100).`,
        `Low margin expansion signals capital would yield higher alpha in productive sectors.`,
      ],
      recommendation: `Recommend selective de-risking and monitoring debt service coverage ratios.`,
      modelInsight,
    };
  } else {
    return {
      headline: `Balanced Equilibrium in ${row.province} ${row.sector}`,
      verdict: 'BALANCED_STABLE',
      narrative: `Economic momentum (${row.economicMomentum}) closely aligns with financing support (${row.financingSupport}), reflecting an efficient credit allocation with a nominal gap of only ${row.capitalGapScore > 0 ? '+' : ''}${row.capitalGapScore} points.`,
      driverPoints: [
        `Turnover growth (${row.subScores.turnoverGrowth}) matches credit growth velocity (${row.subScores.creditGrowth}).`,
        `Liquidity risk is well contained at ${row.subScores.liquidity}/100.`,
        `Bank underwriting matches SME balance sheet fundamentals smoothly.`,
      ],
      recommendation: `Maintain existing credit monitoring schedules and standard syndicate participation.`,
      modelInsight,
    };
  }
}

/* ==========================================================================
   €1M SIMULATOR SERVICE
   Hardcoded deterministic allocation models keyed to investment objectives.
   Teammates can swap with an optimization engine or portfolio API.
   ========================================================================== */

type InvestmentObjective = 'Growth' | 'Low-Risk' | 'Underfinanced Areas' | 'Diversification';

interface AllocationSlice {
  name: string;
  province: string;
  sector: string;
  amount: number; // in Euros (€)
  percentage: number; // 0 - 100
  color: string;
  expectedAlpha: string;
  riskRating: 'Low' | 'Medium' | 'Medium-High';
}

interface SimulatorResult {
  objective: InvestmentObjective;
  totalBudget: number;
  allocations: AllocationSlice[];
  aiRationale: string;
}

// Qualitative slice palette: adjacent slices sit far apart in hue so each
// allocation is separable at a glance on a light background.
const PALETTE = [
  '#2563eb', // blue
  '#f59e0b', // amber
  '#7c3aed', // violet
  '#059669', // emerald
  '#e11d48', // rose
];


/**
 * Rules-based allocator (PRD section 7): score and rank the 15 real cells by
 * the chosen objective, then allocate the budget proportionally across the
 * top 4. Deterministic - no model call decides where the money goes.
 */
function getSimulatorResult(objective: InvestmentObjective): SimulatorResult {
  const TOTAL = 1000000;
  const TOP_N = 4;

  const score = (r: CapitalXRayRow): number => {
    switch (objective) {
      // Most underfinanced first: gap is negative, so invert it.
      case 'Underfinanced Areas':
        return -r.capitalGapScore;
      // Strongest real economy, lightly penalised for existing credit saturation.
      case 'Growth':
        return r.economicMomentum - 0.3 * r.financingSupport;
      // Well-supported, liquid, balanced cells.
      case 'Low-Risk':
        return r.subScores.liquidity + r.subScores.depositStrength - Math.abs(r.capitalGapScore);
      // Spread across provinces and sectors: handled after ranking.
      case 'Diversification':
        return r.economicMomentum - Math.abs(r.capitalGapScore) * 0.2;
    }
  };

  let ranked = [...MOCK_CAPITAL_DATA].sort((a, b) => score(b) - score(a));

  if (objective === 'Diversification') {
    // One cell per province, best-scoring first, to avoid concentration.
    const seen = new Set<string>();
    ranked = ranked.filter((r) => {
      if (seen.has(r.province)) return false;
      seen.add(r.province);
      return true;
    });
  }

  const picked = ranked.slice(0, TOP_N);
  const weights = picked.map((r) => Math.max(score(r) - (score(picked[picked.length - 1]) - 10), 1));
  const weightSum = weights.reduce((a, b) => a + b, 0);

  const allocations: AllocationSlice[] = picked.map((r, i) => {
    const pct = (weights[i] / weightSum) * 100;
    const deficit = r.capitalGapScore < 0;
    return {
      name: `${r.province} · ${r.sector}`,
      province: r.province,
      sector: r.sector,
      amount: Math.round((TOTAL * pct) / 100 / 1000) * 1000,
      percentage: Math.round(pct),
      color: PALETTE[i % PALETTE.length],
      expectedAlpha: `${deficit ? '+' : ''}${(r.economicMomentum / 10 - r.financingSupport / 20).toFixed(1)}%`,
      riskRating:
        r.subScores.liquidity >= 60 ? 'Low' : r.subScores.liquidity >= 35 ? 'Medium' : 'Medium-High',
    };
  });

  const lead = picked[0];
  const rationale: Record<InvestmentObjective, string> = {
    'Underfinanced Areas': `Capital is concentrated where economic momentum most exceeds financing support. ${lead.province} ${lead.sector} leads with a ${Math.abs(lead.capitalGapScore)}-point financing deficit against an economic momentum of ${lead.economicMomentum}/100.`,
    Growth: `Weighted toward the strongest real-economy signals. ${lead.province} ${lead.sector} combines ${lead.economicMomentum}/100 economic momentum with turnover growth scoring ${lead.subScores.turnoverGrowth}/100.`,
    'Low-Risk': `Weighted toward deposit-rich, well-balanced cells. ${lead.province} ${lead.sector} shows liquidity at ${lead.subScores.liquidity}/100 and a gap of only ${Math.abs(lead.capitalGapScore)} points.`,
    Diversification: `One position per province to limit regional concentration, led by ${lead.province} ${lead.sector} at ${lead.economicMomentum}/100 economic momentum.`,
  };

  return { objective, totalBudget: TOTAL, allocations, aiRationale: rationale[objective] };
}

/**
 * Percentage label drawn just outside each donut slice, tinted with that
 * slice's own colour so the arc and its number read as one unit. Colour and
 * value come from our own allocation array rather than the chart library's
 * label props, which vary between recharts versions.
 */
const makeSliceLabel =
  (allocations: AllocationSlice[]) =>
  ({ cx, cy, midAngle, outerRadius, index }: any) => {
    const slice = allocations[index];
    if (!slice) return null;
    const RAD = Math.PI / 180;
    const radius = outerRadius + 15;
    const x = cx + radius * Math.cos(-midAngle * RAD);
    const y = cy + radius * Math.sin(-midAngle * RAD);
    return (
      <text
        x={x}
        y={y}
        fill={slice.color}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={11}
        fontWeight={700}
        fontFamily="monospace"
      >
        {slice.percentage}%
      </text>
    );
  };

/* ==========================================================================
   MAIN COMPONENT
   ========================================================================== */

export default function CapitalXRayApp() {
  // Filters & Sorters State
  const [selectedProvince, setSelectedProvince] = useState<string>('ALL');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [sortCriterion, setSortCriterion] = useState<
    'GAP_UNDERFINANCED' | 'GAP_SURPLUS' | 'MOMENTUM_HIGH' | 'FINANCING_LOW' | 'PROVINCE_AZ'
  >('GAP_UNDERFINANCED');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active Selected Card for Detail / AI Explanation
  const [selectedRowId, setSelectedRowId] = useState<string>('milano-industria');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiRefreshNonce, setAiRefreshNonce] = useState<number>(0);

  // Simulator State
  const [currentObjective, setCurrentObjective] = useState<InvestmentObjective>('Underfinanced Areas');
  const [simulatorChartType, setSimulatorChartType] = useState<'donut' | 'bar'>('donut');

  // Selecting a row re-runs the explanation effect below.
  const handleSelectRow = (id: string) => {
    if (id === selectedRowId) return;
    setSelectedRowId(id);
  };

  // Re-ask the model for the same row.
  const triggerAiRefresh = () => {
    setAiRefreshNonce((n) => n + 1);
  };

  // Find currently selected row object
  const activeRow = useMemo(() => {
    return MOCK_CAPITAL_DATA.find((r) => r.id === selectedRowId) || MOCK_CAPITAL_DATA[0];
  }, [selectedRowId]);

  // Model output for the selected cell (undefined only if the pipeline and the
  // model artifact ever drift apart).
  const activeModel = MODEL_BY_ID[selectedRowId];

  // AI Explanation content.
  // Renders the templated explanation instantly, then upgrades in place with
  // the live Gemini response. If the API key is missing or the call fails the
  // template simply stays - the demo never blanks out. (PRD section 7)
  const [aiExplanation, setAiExplanation] = useState<AiExplanationPayload>(() =>
    getExplanation(activeRow),
  );
  const [aiSource, setAiSource] = useState<'template' | 'gemini'>('template');

  useEffect(() => {
    let cancelled = false;
    setAiExplanation(getExplanation(activeRow));
    setAiSource('template');
    setIsAiLoading(true);

    fetch('/api/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activeRow),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((payload) => {
        if (cancelled) return;
        setAiExplanation(payload);
        setAiSource('gemini');
      })
      .catch(() => {
        /* keep the template */
      })
      .finally(() => {
        if (!cancelled) setIsAiLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeRow, aiRefreshNonce]);

  // Simulator result content
  const simulatorResult = useMemo(() => {
    return getSimulatorResult(currentObjective);
  }, [currentObjective]);

  // Filtered and Sorted Rows for Grid
  const filteredRows = useMemo(() => {
    return MOCK_CAPITAL_DATA.filter((row) => {
      const matchProvince = selectedProvince === 'ALL' || row.province === selectedProvince;
      const matchSector = selectedSector === 'ALL' || row.sector === selectedSector;
      const matchSearch =
        searchQuery.trim() === '' ||
        row.province.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.sector.toLowerCase().includes(searchQuery.toLowerCase());
      return matchProvince && matchSector && matchSearch;
    }).sort((a, b) => {
      if (sortCriterion === 'GAP_UNDERFINANCED') {
        // Most underfinanced first (i.e. most negative capitalGapScore)
        return a.capitalGapScore - b.capitalGapScore;
      }
      if (sortCriterion === 'GAP_SURPLUS') {
        // Most overheated/surplus first
        return b.capitalGapScore - a.capitalGapScore;
      }
      if (sortCriterion === 'MOMENTUM_HIGH') {
        return b.economicMomentum - a.economicMomentum;
      }
      if (sortCriterion === 'FINANCING_LOW') {
        return a.financingSupport - b.financingSupport;
      }
      if (sortCriterion === 'PROVINCE_AZ') {
        return a.province.localeCompare(b.province);
      }
      return 0;
    });
  }, [selectedProvince, selectedSector, sortCriterion, searchQuery]);

  // Aggregate high-level stats across Lombardy dataset
  const aggregateStats = useMemo(() => {
    const total = MOCK_CAPITAL_DATA.length;
    const underfinancedCount = MOCK_CAPITAL_DATA.filter((r) => r.capitalGapScore <= -15).length;
    const overheatedCount = MOCK_CAPITAL_DATA.filter((r) => r.capitalGapScore >= 15).length;
    const balancedCount = total - underfinancedCount - overheatedCount;
    const avgGap = Math.round(
      MOCK_CAPITAL_DATA.reduce((acc, curr) => acc + curr.capitalGapScore, 0) / total
    );
    const byGap = [...MOCK_CAPITAL_DATA].sort((a, b) => a.capitalGapScore - b.capitalGapScore);
    const deepestDeficit = byGap[0];
    const largestSurplus = byGap[byGap.length - 1];
    const provinceCount = new Set(MOCK_CAPITAL_DATA.map((r) => r.province)).size;
    const sectorCount = new Set(MOCK_CAPITAL_DATA.map((r) => r.sector)).size;
    return {
      total, underfinancedCount, overheatedCount, balancedCount, avgGap,
      deepestDeficit, largestSurplus, provinceCount, sectorCount,
    };
  }, []);

  const provincesList = ['ALL', ...Array.from(new Set(MOCK_CAPITAL_DATA.map((r) => r.province))).sort()];
  const sectorsList = ['ALL', ...Array.from(new Set(MOCK_CAPITAL_DATA.map((r) => r.sector))).sort()];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-cyan-200 selection:text-slate-900">
      {/* Top Utility & Status Header */}
      <header className="border-b border-slate-200/80 bg-white/85 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center font-mono font-bold text-white text-lg shadow-sm shadow-cyan-600/25">
              CX
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-slate-900">CAPITAL X-RAY</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-cyan-50 text-cyan-700 border border-cyan-300">
                  LOMBARDY v1.4
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-mono hidden sm:block">
                Regional Credit Deficit & Economic Velocity Radar
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="hidden md:flex items-center gap-3 bg-white border border-slate-200 rounded px-3 py-1.5">
              <span className="text-slate-600">Underfinanced Clusters:</span>
              <span className="text-rose-600 font-semibold">{aggregateStats.underfinancedCount} / {aggregateStats.total}</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-600">Overheated:</span>
              <span className="text-blue-600 font-semibold">{aggregateStats.overheatedCount}</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-600">Avg Capital Gap:</span>
              <span className="text-amber-600 font-semibold">{aggregateStats.avgGap} pts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] text-slate-600 uppercase tracking-wider hidden sm:inline">
                Live Feed
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* ==========================================================================
            1. HERO SECTION
            ========================================================================== */}
        <section id="hero" className="relative border-b border-slate-200/80 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 text-xs font-mono">
                <Cpu className="w-3.5 h-3.5 text-cyan-700" />
                <span>REGIONAL FINTECH INTELLIGENCE DEMO</span>
                <span className="text-slate-400">·</span>
                <span className="text-cyan-700">FINTECH HACKATHON 2026</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                See where money flows.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-sky-600 to-amber-600">
                  Discover where capital is missing.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-700 max-w-3xl leading-relaxed">
                Banks and real economy enterprises operate on disconnected datasets. Capital X-Ray
                cross-examines company operational performance against banking credit registers to identify
                dangerous capital gaps and untapped financing opportunities across Lombardy.
              </p>

              {/* Problem/Solution Callout Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-3.5 space-y-1">
                  <div className="flex items-center gap-2 text-rose-600 font-mono text-xs font-semibold">
                    <TrendingDown className="w-4 h-4" />
                    <span>The Capital Gap</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">
                    Firms with 80+ turnover growth receive sub-40 credit indexing, forcing risky self-financing.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-3.5 space-y-1">
                  <div className="flex items-center gap-2 text-sky-600 font-mono text-xs font-semibold">
                    <TrendingUp className="w-4 h-4" />
                    <span>Overheated Surplus</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">
                    Legacy banking inertia pours surplus debt into low-momentum sectors, compounding default risk.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-3.5 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-600 font-mono text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Capital Re-Routing</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">
                    Arming credit officers and funds with verified data to deploy capital where alpha is highest.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Summary Terminal Widget */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xl shadow-slate-300/40 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <span className="text-slate-600 flex items-center gap-1.5 font-semibold text-slate-800">
                  <Activity className="w-3.5 h-3.5 text-cyan-700" />
                  LOMBARDY MACRO INDEX
                </span>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                  2015-2020
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Provinces Monitored:</span>
                  <span className="text-slate-800 font-semibold">{aggregateStats.provinceCount} Regional Hubs</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Key Economic Sectors:</span>
                  <span className="text-slate-800 font-semibold">{aggregateStats.sectorCount} Macro-Sectors</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Deepest Capital Deficit:</span>
                  <span className="text-rose-600 font-bold">{aggregateStats.deepestDeficit.province} {aggregateStats.deepestDeficit.sector} ({aggregateStats.deepestDeficit.capitalGapScore})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Largest Credit Surplus:</span>
                  <span className="text-sky-600 font-bold">{aggregateStats.largestSurplus.province} {aggregateStats.largestSurplus.sector} (+{aggregateStats.largestSurplus.capitalGapScore})</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Methodology:</span>
                <span className="text-slate-700">Istat Frame SBS + Banca d'Italia</span>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            2. X-RAY GRID SECTION
            ========================================================================== */}
        <section id="xray-grid" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-cyan-700 font-mono text-xs uppercase tracking-wider mb-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Section 02 · Province × Sector Analysis</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">The Capital X-Ray Matrix</h2>
              <p className="text-sm text-slate-600 mt-0.5">
                Inspect how economic engine strength compares to financing received. Select any card to run the deep AI X-Ray explanation.
              </p>
            </div>

            {/* Legend / Decoder */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono bg-white border border-slate-200 shadow-sm px-3 py-2 rounded-lg">
              <span className="text-slate-600 text-[11px]">Gap Metric:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                <span className="text-rose-700">Underfinanced (Deficit &lt; -15)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-emerald-700">Balanced (±14)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
                <span className="text-sky-700">Overheated Surplus (&gt; +15)</span>
              </div>
            </div>
          </div>

          {/* Filter & Sorter Toolbar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 text-xs">
            {/* Province Filter */}
            <div className="lg:col-span-3 space-y-1">
              <label className="text-[11px] font-mono text-slate-600 uppercase tracking-wide flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-700" />
                Filter Province
              </label>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-600 font-sans"
              >
                {provincesList.map((p) => (
                  <option key={p} value={p}>
                    {p === 'ALL' ? 'All Provinces (Lombardy)' : p}
                  </option>
                ))}
              </select>
            </div>

            {/* Sector Filter */}
            <div className="lg:col-span-3 space-y-1">
              <label className="text-[11px] font-mono text-slate-600 uppercase tracking-wide flex items-center gap-1">
                <Filter className="w-3 h-3 text-cyan-700" />
                Filter Sector
              </label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-600 font-sans"
              >
                {sectorsList.map((s) => (
                  <option key={s} value={s}>
                    {s === 'ALL' ? 'All Economic Sectors' : s}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="lg:col-span-3 space-y-1">
              <label className="text-[11px] font-mono text-slate-600 uppercase tracking-wide flex items-center gap-1">
                <Sliders className="w-3 h-3 text-cyan-700" />
                Sort Severity
              </label>
              <select
                value={sortCriterion}
                onChange={(e) =>
                  setSortCriterion(
                    e.target.value as
                      | 'GAP_UNDERFINANCED'
                      | 'GAP_SURPLUS'
                      | 'MOMENTUM_HIGH'
                      | 'FINANCING_LOW'
                      | 'PROVINCE_AZ'
                  )
                }
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-600 font-sans"
              >
                <option value="GAP_UNDERFINANCED">Most Underfinanced (Severe Deficit First)</option>
                <option value="GAP_SURPLUS">Most Overheated (Surplus First)</option>
                <option value="MOMENTUM_HIGH">Highest Economic Momentum</option>
                <option value="FINANCING_LOW">Lowest Financing Support</option>
                <option value="PROVINCE_AZ">Province Name (A-Z)</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="lg:col-span-3 space-y-1">
              <label className="text-[11px] font-mono text-slate-600 uppercase tracking-wide flex items-center gap-1">
                <Search className="w-3 h-3 text-cyan-700" />
                Quick Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Bergamo, Costruzioni..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded px-2.5 py-1.5 pl-8 focus:outline-none focus:border-cyan-600 font-sans"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          {/* Grid of X-Ray Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRows.map((row) => {
              const isSelected = row.id === selectedRowId;
              const isDeficit = row.capitalGapScore <= -15;
              const isSurplus = row.capitalGapScore >= 15;
              const isBalanced = !isDeficit && !isSurplus;

              // Color classes for score & styling
              const scoreBadgeColor = isDeficit
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : isSurplus
                ? 'bg-sky-50 text-sky-700 border-sky-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200';

              const cardBorder = isSelected
                ? 'ring-2 ring-cyan-600 border-cyan-600 bg-white shadow-md shadow-cyan-600/10'
                : 'border-slate-200 bg-white shadow-sm hover:border-cyan-300 hover:shadow-md';

              return (
                <div
                  key={row.id}
                  onClick={() => handleSelectRow(row.id)}
                  className={`relative cursor-pointer transition-all duration-150 rounded-xl border p-4.5 flex flex-col justify-between group ${cardBorder}`}
                >
                  {/* Top Bar: Province, Sector, and Signed Capital Gap Score */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
                          <MapPin className="w-3 h-3 text-cyan-700" />
                          <span>{row.province}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 tracking-tight mt-0.5 group-hover:text-cyan-700 transition-colors">
                          {row.sector}
                        </h3>
                      </div>

                      {/* Capital Gap Score Tag */}
                      <div className="text-right">
                        <div
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded font-mono font-bold text-sm border shadow-sm ${scoreBadgeColor}`}
                        >
                          {isDeficit && <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />}
                          {isSurplus && <ArrowUpRight className="w-3.5 h-3.5 text-sky-600" />}
                          {isBalanced && <span className="text-xs">≈</span>}
                          <span>
                            {row.capitalGapScore > 0 ? `+${row.capitalGapScore}` : row.capitalGapScore}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-600 mt-0.5 uppercase">
                          {isDeficit ? 'Capital Deficit' : isSurplus ? 'Credit Surplus' : 'Balanced'}
                        </div>
                      </div>
                    </div>

                    {/* X-Ray Progress Bars Bar Set */}
                    <div className="space-y-2.5 bg-slate-50/60 rounded-lg p-3 border border-slate-200/60 text-xs">
                      {/* Metric 1: Economic Strength */}
                      <div>
                        <div className="flex justify-between items-center text-[11px] mb-1 font-mono">
                          <span className="text-slate-600">Economic Strength</span>
                          <span className="text-slate-800 font-semibold">{row.economicMomentum}/100</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-600 to-emerald-600 rounded-full"
                            style={{ width: `${row.economicMomentum}%` }}
                          />
                        </div>
                      </div>

                      {/* Metric 2: Business Momentum */}
                      <div>
                        <div className="flex justify-between items-center text-[11px] mb-1 font-mono">
                          <span className="text-slate-600">Business Momentum</span>
                          <span className="text-slate-800 font-semibold">{row.subScores.businessGrowth}/100</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${row.subScores.businessGrowth}%` }}
                          />
                        </div>
                      </div>

                      {/* Metric 3: Credit Support */}
                      <div>
                        <div className="flex justify-between items-center text-[11px] mb-1 font-mono">
                          <span className="text-slate-600">Credit Support</span>
                          <span
                            className={`font-semibold ${
                              row.financingSupport < 40 ? 'text-rose-600' : 'text-slate-800'
                            }`}
                          >
                            {row.financingSupport}/100
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              row.financingSupport < 40 ? 'bg-rose-600' : 'bg-sky-600'
                            }`}
                            style={{ width: `${row.financingSupport}%` }}
                          />
                        </div>
                      </div>

                      {/* Metric 4: Liquidity */}
                      <div>
                        <div className="flex justify-between items-center text-[11px] mb-1 font-mono">
                          <span className="text-slate-600">Liquidity Index</span>
                          <span className="text-slate-800 font-semibold">{row.subScores.liquidity}/100</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-600 rounded-full"
                            style={{ width: `${row.subScores.liquidity}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom selection affordance */}
                  <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600 font-mono">
                    <span className="text-[11px]">
                      Turnover +{row.subScores.turnoverGrowth}% · Credit +{row.subScores.creditGrowth}%
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                        isSelected ? 'text-cyan-700' : 'text-slate-500 group-hover:text-slate-700'
                      }`}
                    >
                      {isSelected ? 'Active Analysis' : 'Examine X-Ray'}
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredRows.length === 0 && (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-xl space-y-2">
              <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto" />
              <h3 className="text-base font-semibold text-slate-900">No Matching Clusters Found</h3>
              <p className="text-xs text-slate-600">
                Adjust province or sector filters to view other Lombardy economic data rows.
              </p>
            </div>
          )}
        </section>

        {/* ==========================================================================
            3. "WHY IS THIS HIGHLIGHTED?" PANEL
            ========================================================================== */}
        <section
          id="why-highlighted"
          className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl shadow-slate-300/40 space-y-6"
        >
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2 text-cyan-700 font-mono text-xs uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-700" />
                <span>Section 03 · AI Synthesis & Forensic Breakdown</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                <span>Why is this highlighted?</span>
                <span className="text-xs font-mono font-medium px-2.5 py-1 rounded bg-slate-200 text-cyan-700 border border-slate-300">
                  {activeRow.province} — {activeRow.sector}
                </span>
              </h2>
            </div>

            {/* Re-trigger / Status controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={triggerAiRefresh}
                disabled={isAiLoading}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300 text-xs font-mono transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin text-cyan-700' : ''}`} />
                <span>{isAiLoading ? 'Synthesizing...' : 'Re-run AI Synthesis'}</span>
              </button>
              <span
                title={aiSource === 'gemini' ? 'Generated live by Gemini from this row’s scores' : 'Deterministic fallback template'}
                className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                  aiSource === 'gemini'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-200 text-slate-600 border-slate-300'
                }`}
              >
                {aiSource === 'gemini' ? 'GEMINI LIVE' : 'FALLBACK'}
              </span>
            </div>
          </div>

          {/* AI Content vs Loading State */}
          {isAiLoading ? (
            <div className="space-y-4 py-6">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-700">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                <span>CROSS-EXAMINING LOMBARDY PROVINCIAL REGISTERS & BANK OF ITALY DISCLOSURES...</span>
              </div>
              {/* Skeleton Shimmer */}
              <div className="space-y-3 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200/70 rounded w-full" />
                <div className="h-4 bg-slate-200/70 rounded w-5/6" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
                  <div className="h-20 bg-slate-200/50 rounded" />
                  <div className="h-20 bg-slate-200/50 rounded" />
                  <div className="h-20 bg-slate-200/50 rounded" />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Top Summary Headline & Badge */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 bg-slate-50/70 border border-slate-200 rounded-xl p-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                        aiExplanation.verdict === 'DEFICIT_UNDERFINANCED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : aiExplanation.verdict === 'SURPLUS_OVERHEATED'
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {aiExplanation.verdict === 'DEFICIT_UNDERFINANCED'
                        ? 'CRITICAL CAPITAL GAP'
                        : aiExplanation.verdict === 'SURPLUS_OVERHEATED'
                        ? 'OVERHEATED SURPLUS'
                        : 'BALANCED EQUILIBRIUM'}
                    </span>
                    <span className="text-xs text-slate-600 font-mono">
                      Gap Score: {activeRow.capitalGapScore > 0 ? `+${activeRow.capitalGapScore}` : activeRow.capitalGapScore} pts
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
                    {aiExplanation.headline}
                  </h3>

                  <p className="text-sm text-slate-700 leading-relaxed font-sans">
                    {aiExplanation.narrative}
                  </p>
                </div>

                {/* Direct Numeric Disparity Badge */}
                <div className="bg-white border border-slate-200 rounded-lg p-3 shrink-0 flex flex-col justify-center text-center font-mono min-w-[150px]">
                  <div className="text-[10px] text-slate-600 uppercase tracking-wide">Mismatch Vector</div>
                  <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                    {activeRow.economicMomentum} vs {activeRow.financingSupport}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    Econ Power vs Bank Credit
                  </div>
                </div>
              </div>

              {/* Subscores Forensic Grid */}
              <div>
                <h4 className="text-xs font-mono uppercase text-slate-600 tracking-wider mb-3 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-cyan-700" />
                  Underlying Sub-Metric Diagnostic (0-100 Scale)
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
                    <div className="text-[10px] font-mono text-slate-600 uppercase">Turnover Growth</div>
                    <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                      {activeRow.subScores.turnoverGrowth}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-mono mt-0.5">Commercial volume</div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
                    <div className="text-[10px] font-mono text-slate-600 uppercase">Business Growth</div>
                    <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                      {activeRow.subScores.businessGrowth}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-mono mt-0.5">Enterprise registry</div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
                    <div className="text-[10px] font-mono text-slate-600 uppercase">Sector Performance</div>
                    <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                      {activeRow.subScores.sectorPerformance}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-mono mt-0.5">Macro strength</div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
                    <div className="text-[10px] font-mono text-slate-600 uppercase">Credit Growth</div>
                    <div
                      className={`text-lg font-bold font-mono mt-0.5 ${
                        activeRow.subScores.creditGrowth < 40 ? 'text-rose-600' : 'text-slate-900'
                      }`}
                    >
                      {activeRow.subScores.creditGrowth}
                    </div>
                    <div className="text-[10px] text-slate-600 font-mono mt-0.5">Bank loans granted</div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
                    <div className="text-[10px] font-mono text-slate-600 uppercase">Deposit Strength</div>
                    <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                      {activeRow.subScores.depositStrength}
                    </div>
                    <div className="text-[10px] text-slate-600 font-mono mt-0.5">Corporate savings</div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
                    <div className="text-[10px] font-mono text-slate-600 uppercase">Liquidity Index</div>
                    <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                      {activeRow.subScores.liquidity}
                    </div>
                    <div className="text-[10px] text-cyan-700 font-mono mt-0.5">Cash conversion</div>
                  </div>
                </div>
              </div>

              {/* Forensic Driver Bullets & Recommendation */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-7 bg-slate-50/60 border border-slate-200/80 rounded-xl p-4 space-y-2">
                  <div className="text-xs font-mono text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    AI Forensic Driver Findings
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {aiExplanation.driverPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-cyan-700 font-mono mt-0.5">›</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="lg:col-span-5 bg-gradient-to-br from-white to-cyan-50 border border-cyan-200 rounded-xl p-4 space-y-2">
                  <div className="text-xs font-mono text-cyan-700 uppercase tracking-wide flex items-center gap-1.5 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-700" />
                    Actionable Capital Recommendation
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {aiExplanation.recommendation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>


        {/* ==========================================================================
            4. MACHINE LEARNING MODEL SECTION
            ========================================================================== */}
        <section
          id="ml-model"
          className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-slate-300/40"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2 text-cyan-700 font-mono text-xs uppercase tracking-wider mb-1">
                <Brain className="w-3.5 h-3.5" />
                <span>Section 04 · Supervised Model</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Expected-Credit Benchmark
              </h2>
              <p className="text-sm text-slate-600 mt-0.5 max-w-3xl">
                A regression trained on the {MODEL_META.trainRows}-row province × sector × year panel learns
                how much credit a cell with given fundamentals normally receives. The residual — actual minus
                expected — is a <span className="font-semibold text-slate-800">learned</span> capital gap, not
                a hand-weighted one.
              </p>
            </div>

            <div className="shrink-0 font-mono text-[11px] bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-600">
              <div className="text-slate-500 uppercase tracking-wide text-[10px] mb-1">Model spec</div>
              <div className="text-slate-800">log(loans) ~ log(turnover)</div>
              <div className="text-slate-800 pl-[7.5ch]">+ log(businesses)</div>
              <div className="text-slate-800 pl-[7.5ch]">+ sector + year</div>
            </div>
          </div>

          {/* Validation metrics: the numbers a judge will ask about. */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
              <div className="text-[10px] font-mono text-emerald-700 uppercase tracking-wide">
                Leave-one-cell-out R²
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-700 mt-0.5">
                {MODEL_METRICS.leaveOneCellOutR2.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-600 font-mono mt-1 leading-snug">
                Predicting a province × sector held out of training entirely
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <div className="text-[10px] font-mono text-slate-600 uppercase tracking-wide">
                Size-stripped R²
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-0.5">
                {MODEL_METRICS.loansPerBusinessR2.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-600 font-mono mt-1 leading-snug">
                Same model on loans <em>per business</em> — rules out “big province, big loan book”
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <div className="text-[10px] font-mono text-slate-600 uppercase tracking-wide">
                Sector-only baseline
              </div>
              <div className="text-2xl font-bold font-mono text-rose-600 mt-0.5">
                {MODEL_METRICS.sectorOnlyBaselineR2.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-600 font-mono mt-1 leading-snug">
                Negative — sector alone is worse than guessing the mean
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <div className="text-[10px] font-mono text-slate-600 uppercase tracking-wide">
                Typical error
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-0.5">
                ±{MODEL_METRICS.typicalErrorPct.toFixed(0)}%
              </div>
              <div className="text-[10px] text-slate-600 font-mono mt-1 leading-snug">
                Residual σ = {MODEL_METRICS.residualSdLogPts} log points
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Selected cell: actual vs model-expected lending */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-mono text-slate-600 uppercase tracking-wide">
                  Selected Cell
                </div>
                {activeModel && (
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      activeModel.verdict === 'UNDERFINANCED'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : activeModel.verdict === 'OVERFINANCED'
                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                        : 'bg-slate-100 text-slate-600 border-slate-300'
                    }`}
                  >
                    {activeModel.verdict.replace('_', ' ')}
                  </span>
                )}
              </div>

              <div className="font-bold text-slate-900 tracking-tight">
                {activeRow.province} · {activeRow.sector}
              </div>

              {activeModel ? (
                <>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-[11px] font-mono mb-1">
                        <span className="text-slate-600">Model-expected credit</span>
                        <span className="text-slate-800 font-semibold">
                          €{Math.round(activeModel.expectedLoansKEUR / 1000).toLocaleString('de-DE')}M
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-400 rounded-full"
                          style={{
                            width: `${
                              (activeModel.expectedLoansKEUR /
                                Math.max(activeModel.expectedLoansKEUR, activeModel.actualLoansKEUR)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-mono mb-1">
                        <span className="text-slate-600">Actual credit</span>
                        <span className="text-slate-800 font-semibold">
                          €{Math.round(activeModel.actualLoansKEUR / 1000).toLocaleString('de-DE')}M
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            activeModel.creditGapPct < 0 ? 'bg-rose-600' : 'bg-sky-600'
                          }`}
                          style={{
                            width: `${
                              (activeModel.actualLoansKEUR /
                                Math.max(activeModel.expectedLoansKEUR, activeModel.actualLoansKEUR)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end justify-between border-t border-slate-200 pt-3">
                    <div>
                      <div className="text-[10px] font-mono text-slate-600 uppercase">Learned gap</div>
                      <div
                        className={`text-3xl font-bold font-mono ${
                          activeModel.creditGapPct < 0 ? 'text-rose-600' : 'text-sky-600'
                        }`}
                      >
                        {activeModel.creditGapPct > 0 ? '+' : ''}
                        {activeModel.creditGapPct.toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-[10px] text-slate-600 uppercase">z-score</div>
                      <div className="text-lg font-bold text-slate-800">
                        {activeModel.zScore > 0 ? '+' : ''}
                        {activeModel.zScore.toFixed(2)}σ
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-snug">
                    {activeModel.creditGapPct < 0
                      ? `Receives ${Math.abs(activeModel.creditGapPct).toFixed(1)}% less credit than peer cells with the same turnover, business count and sector.`
                      : `Receives ${activeModel.creditGapPct.toFixed(1)}% more credit than peer cells with the same turnover, business count and sector.`}
                  </p>

                  {aiExplanation.modelInsight && (
                    <div className="border-t border-slate-200 pt-3 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wide text-cyan-700 font-semibold">
                        <Sparkles className="w-3 h-3" />
                        <span>AI reading of the model</span>
                      </div>
                      <p className="text-[11px] text-slate-700 leading-relaxed">
                        {aiExplanation.modelInsight}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-slate-600">No model output for this cell.</p>
              )}
            </div>

            {/* Ranked learned gaps across all cells */}
            <div className="lg:col-span-7 space-y-2">
              <div className="text-xs font-mono text-slate-600 uppercase tracking-wide flex items-center justify-between">
                <span>Learned Credit Gap · All {MODEL_CELLS.length} Cells</span>
                <span className="text-slate-500 normal-case">← under-lent · over-lent →</span>
              </div>

              <div className="space-y-1">
                {MODEL_CELLS.map((cell) => {
                  const isActive = cell.id === selectedRowId;
                  const width = Math.min(Math.abs(cell.creditGapPct) / MODEL_GAP_SCALE, 1) * 50;
                  const negative = cell.creditGapPct < 0;
                  return (
                    <button
                      key={cell.id}
                      onClick={() => handleSelectRow(cell.id)}
                      className={`w-full text-left rounded-lg px-2 py-1.5 transition-colors cursor-pointer ${
                        isActive ? 'bg-cyan-50 ring-1 ring-cyan-300' : 'hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-[38%] shrink-0 truncate text-[11px] font-mono ${
                            isActive ? 'text-cyan-800 font-semibold' : 'text-slate-700'
                          }`}
                        >
                          {cell.province} · {cell.sector}
                        </span>

                        {/* Diverging bar, centred on zero */}
                        <span className="relative flex-1 h-3.5 flex items-center">
                          <span className="absolute inset-y-0 left-1/2 w-px bg-slate-300" />
                          <span
                            className={`absolute h-2.5 rounded-sm ${
                              negative ? 'bg-rose-500' : 'bg-sky-500'
                            } ${cell.isAnomaly ? 'ring-1 ring-offset-1 ring-slate-900/40' : ''}`}
                            style={
                              negative
                                ? { right: '50%', width: `${width}%` }
                                : { left: '50%', width: `${width}%` }
                            }
                          />
                        </span>

                        <span
                          className={`w-14 shrink-0 text-right text-[11px] font-mono font-semibold ${
                            negative ? 'text-rose-600' : 'text-sky-600'
                          }`}
                        >
                          {cell.creditGapPct > 0 ? '+' : ''}
                          {cell.creditGapPct.toFixed(0)}%
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Learned coefficients + the caveats that keep this honest */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="text-xs font-mono text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-700" />
                Learned Coefficients
              </div>
              <div className="space-y-1 font-mono text-[11px]">
                {Object.entries(MODEL_COEFFICIENTS).map(([name, value]) => (
                  <div key={name} className="flex justify-between gap-3">
                    <span className="text-slate-600">{name}</span>
                    <span className={`font-semibold ${value < 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                      {value > 0 ? '+' : ''}
                      {value.toFixed(3)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1.5">
              <div className="text-xs font-mono text-amber-700 uppercase tracking-wide flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                What this model does not claim
              </div>
              <ul className="text-[11px] text-slate-700 space-y-1 leading-snug">
                <li>
                  › Trained on {MODEL_META.trainRows} rows from {MODEL_META.cells} cells. It is a peer
                  benchmark, not a credit-risk or affordability model, and it establishes no causality.
                </li>
                <li>
                  › A negative gap means a cell is lent less than statistically similar cells — not that it
                  <em> deserves</em> more credit. Loan quality and demand are unobserved here.
                </li>
                <li>
                  › Ranks cells almost independently of the hand-weighted Capital Gap Score
                  (r = {MODEL_METRICS.agreementWithHeuristic.toFixed(2)}). The heuristic measures 2015→2020
                  growth mismatch; the model measures level mismatch against peers. Both are shown rather
                  than one being asserted as correct.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            5. €1M SIMULATOR SECTION
            ========================================================================== */}
        <section
          id="simulator"
          className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-slate-300/40"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2 text-cyan-700 font-mono text-xs uppercase tracking-wider mb-1">
                <Coins className="w-3.5 h-3.5" />
                <span>Section 05 · Strategic Allocation Engine</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                €1,000,000 Regional Capital Simulator
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                Simulate optimal capital deployment across Lombardy based on fund investment mandates.
              </p>
            </div>

            {/* Objective Selector Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 border border-slate-200 p-1.5 rounded-xl">
              {(['Underfinanced Areas', 'Growth', 'Low-Risk', 'Diversification'] as InvestmentObjective[]).map(
                (obj) => {
                  const isActive = currentObjective === obj;
                  return (
                    <button
                      key={obj}
                      onClick={() => setCurrentObjective(obj)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                        isActive
                          ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/25'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {obj}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Simulator Content: Chart & Breakdown Table */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Chart Area */}
            <div className="lg:col-span-5 bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-full flex items-center justify-between text-xs font-mono text-slate-600 mb-2">
                <span>Budget: €1,000,000</span>
                <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200">
                  <button
                    onClick={() => setSimulatorChartType('donut')}
                    className={`px-1.5 py-0.5 rounded text-[10px] ${
                      simulatorChartType === 'donut' ? 'text-cyan-700 font-bold' : 'text-slate-500'
                    }`}
                  >
                    Donut
                  </button>
                  <span>/</span>
                  <button
                    onClick={() => setSimulatorChartType('bar')}
                    className={`px-1.5 py-0.5 rounded text-[10px] ${
                      simulatorChartType === 'bar' ? 'text-cyan-700 font-bold' : 'text-slate-500'
                    }`}
                  >
                    Bar
                  </button>
                </div>
              </div>

              <div className="w-full h-64 relative flex items-center justify-center">
                {simulatorChartType === 'donut' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={simulatorResult.allocations}
                        dataKey="amount"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={58}
                        outerRadius={84}
                        paddingAngle={3}
                        labelLine={false}
                        label={makeSliceLabel(simulatorResult.allocations)}
                        isAnimationActive={false}
                      >
                        {simulatorResult.allocations.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any) => [`€${Number(val || 0).toLocaleString('de-DE')}`, 'Simulated Capital']}
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#cbd5e1',
                          borderRadius: '8px',
                          boxShadow: '0 6px 18px rgba(15, 23, 42, 0.12)',
                          color: '#0f172a',
                          fontFamily: 'monospace',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={simulatorResult.allocations}
                      layout="vertical"
                      margin={{ top: 10, right: 20, left: 40, bottom: 5 }}
                    >
                      <XAxis
                        type="number"
                        domain={[0, 500000]}
                        tickFormatter={(val) => `€${val / 1000}k`}
                        stroke="#64748b"
                        fontSize={10}
                      />
                      <YAxis dataKey="province" type="category" stroke="#64748b" fontSize={11} />
                      <Tooltip
                        formatter={(val: any) => [`€${Number(val || 0).toLocaleString('de-DE')}`, 'Simulated Capital']}
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#cbd5e1',
                          borderRadius: '8px',
                          boxShadow: '0 6px 18px rgba(15, 23, 42, 0.12)',
                          color: '#0f172a',
                          fontFamily: 'monospace',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                        {simulatorResult.allocations.map((entry, index) => (
                          <Cell key={`bar-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {/* Donut Center Total Overlay */}
                {simulatorChartType === 'donut' && (
                  <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-[10px] font-mono text-slate-600 uppercase">DEPLOYED</span>
                    <span className="text-base font-bold font-mono text-slate-900">€1.00M</span>
                    <span className="text-[9px] text-cyan-700 font-mono">100% Budget</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Allocation Table & Metrics */}
            <div className="lg:col-span-7 space-y-3">
              <div className="text-xs font-mono text-slate-600 uppercase tracking-wide flex items-center justify-between">
                <span>Top Matching Clusters</span>
                <span>Target Objective: {currentObjective}</span>
              </div>

              <div className="space-y-2.5">
                {simulatorResult.allocations.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <div>
                        <div className="font-bold text-slate-900 tracking-tight">{item.name}</div>
                        <div className="text-[11px] text-slate-600 font-mono">
                          Target Yield: <span className="text-emerald-600 font-semibold">{item.expectedAlpha}</span> · Risk: {item.riskRating}
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="font-bold text-slate-900 text-sm">
                        €{item.amount.toLocaleString('de-DE')}
                      </div>
                      <div className="text-[11px] text-slate-600">{item.percentage}% Allocation</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Simulator Rationale Box */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4.5 space-y-1.5 font-sans">
            <div className="flex items-center gap-2 text-cyan-700 font-mono text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Allocation Strategy Rationale</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">{simulatorResult.aiRationale}</p>
          </div>
        </section>

        {/* ==========================================================================
            5. FOOTER / CLOSING SECTION
            ========================================================================== */}
        <footer className="border-t border-slate-200 pt-8 pb-12 space-y-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="font-mono font-bold text-slate-900 text-sm">CAPITAL X-RAY</span>
                <span className="text-xs text-slate-500 font-mono">· HACKATHON EDITION</span>
              </div>
              <p className="text-xs text-slate-600 max-w-xl">
                Capital X-Ray: helping banks, funds, and policymakers see where money should flow next.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
              <span>Lombardy Dataset (ISTAT/ABI Proxy)</span>
              <span>·</span>
              <span>Single-Page React Architecture</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono border-t border-slate-200 pt-4 flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>© 2026 Capital X-Ray Technologies · Built for Fintech Wealth Management & Credit Innovation</span>
            <span>Zero Server State · Plug-and-play API Service Interfaces</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
