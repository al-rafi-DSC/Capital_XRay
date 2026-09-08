"""Capital X-Ray - emit a single self-contained HTML demo.

Reads web/data.json (produced by build_dataset.py) and inlines it into one
HTML file that opens by double-clicking. No server, no npm, no network.
This is the PRD section 9 live-demo safety net.

Run:  python pipeline/build_standalone.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "web" / "data.json"
OUT = ROOT / "web" / "capital-x-ray.html"

PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Capital X-Ray - Lombardy</title>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0; background: #020617; color: #e2e8f0;
    font: 14px/1.5 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
  header {
    border-bottom: 1px solid #1e293b; background: #020617;
    position: sticky; top: 0; z-index: 10; backdrop-filter: blur(8px);
  }
  .wrap { max-width: 1180px; margin: 0 auto; padding: 0 20px; }
  .hrow { height: 62px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .logo {
    width: 34px; height: 34px; border-radius: 6px; display: grid; place-items: center;
    background: linear-gradient(135deg, #06b6d4, #2563eb); color: #020617;
    font-weight: 800; font-size: 15px;
  }
  .brand { display: flex; align-items: center; gap: 11px; }
  .title { font-weight: 700; letter-spacing: -0.01em; color: #fff; }
  .tag {
    font-size: 10px; padding: 2px 6px; border-radius: 4px;
    background: #083344; color: #67e8f9; border: 1px solid #155e75;
  }
  .sub { font-size: 11px; color: #94a3b8; }
  .hstat { display: flex; gap: 14px; font-size: 12px; align-items: center; }
  .chip {
    background: #0f172a; border: 1px solid #1e293b; border-radius: 6px;
    padding: 6px 11px; display: flex; gap: 8px; align-items: center;
  }
  .muted { color: #94a3b8; }
  .rose { color: #fb7185; } .sky { color: #38bdf8; } .emerald { color: #34d399; }
  .amber { color: #fbbf24; }
  h2 { font-size: 19px; margin: 0 0 3px; color: #fff; letter-spacing: -0.01em; }
  .eyebrow {
    font-size: 11px; text-transform: uppercase; letter-spacing: 0.09em;
    color: #22d3ee; margin-bottom: 5px;
  }
  section { margin: 26px 0; }
  .panel { background: #0f172a; border: 1px solid #1e293b; border-radius: 14px; padding: 22px; }
  .controls { display: flex; gap: 10px; flex-wrap: wrap; margin: 16px 0; }
  select, button {
    background: #1e293b; color: #e2e8f0; border: 1px solid #334155;
    border-radius: 7px; padding: 7px 12px; font-size: 13px; font-family: inherit; cursor: pointer;
  }
  select:hover, button:hover { background: #334155; }
  button.active { background: #0e7490; border-color: #06b6d4; color: #fff; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(255px, 1fr)); gap: 13px; }
  .card {
    background: #0f172a; border: 1px solid #1e293b; border-radius: 11px;
    padding: 15px; cursor: pointer; transition: border-color .12s, transform .12s;
  }
  .card:hover { border-color: #475569; transform: translateY(-2px); }
  .card.sel { border-color: #06b6d4; box-shadow: 0 0 0 1px #06b6d4; }
  .card.deficit { border-left: 3px solid #f43f5e; }
  .card.surplus { border-left: 3px solid #38bdf8; }
  .card.balanced { border-left: 3px solid #64748b; }
  .cardhead { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
  .prov { font-weight: 650; color: #fff; font-size: 14px; }
  .sect { font-size: 11px; color: #94a3b8; margin-top: 1px; }
  .gap { font-size: 21px; font-weight: 750; font-family: ui-monospace, monospace; }
  .verdict { font-size: 9.5px; letter-spacing: .07em; text-transform: uppercase; margin-top: 3px; }
  .bars { margin-top: 12px; display: grid; gap: 6px; }
  .bar { display: grid; grid-template-columns: 74px 1fr 30px; gap: 8px; align-items: center; font-size: 10.5px; }
  .track { height: 5px; background: #1e293b; border-radius: 3px; overflow: hidden; }
  .fill { height: 100%; border-radius: 3px; }
  .detail { display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px; }
  @media (max-width: 860px) { .detail { grid-template-columns: 1fr; } }
  .kv { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #1e293b; font-size: 12.5px; }
  .kv:last-child { border-bottom: 0; }
  .badge {
    display: inline-block; font-size: 10px; padding: 2px 7px; border-radius: 4px;
    border: 1px solid; letter-spacing: .04em;
  }
  .b-def { background: #4c0519; color: #fda4af; border-color: #9f1239; }
  .b-sur { background: #082f49; color: #7dd3fc; border-color: #0369a1; }
  .b-bal { background: #1e293b; color: #cbd5e1; border-color: #475569; }
  ul { margin: 9px 0 0; padding-left: 17px; }
  li { margin: 5px 0; font-size: 12.5px; color: #cbd5e1; }
  .rec {
    margin-top: 13px; padding: 11px; background: #042f2e; border: 1px solid #115e59;
    border-radius: 8px; font-size: 12.5px; color: #99f6e4;
  }
  .alloc { display: flex; align-items: center; gap: 11px; padding: 9px 0; border-bottom: 1px solid #1e293b; }
  .swatch { width: 11px; height: 11px; border-radius: 3px; flex: 0 0 auto; }
  .amt { margin-left: auto; font-family: ui-monospace, monospace; font-weight: 650; color: #fff; }
  footer { border-top: 1px solid #1e293b; margin-top: 34px; padding: 18px 0 34px; font-size: 11.5px; color: #64748b; }
  .note { font-size: 11.5px; color: #94a3b8; margin-top: 7px; }
</style>
</head>
<body>
<header><div class="wrap hrow">
  <div class="brand">
    <div class="logo">CX</div>
    <div>
      <div style="display:flex;align-items:center;gap:8px">
        <span class="title">CAPITAL X-RAY</span>
        <span class="tag mono">LOMBARDY</span>
      </div>
      <div class="sub mono">Regional Credit Deficit &amp; Economic Velocity Radar</div>
    </div>
  </div>
  <div class="hstat mono">
    <div class="chip"><span class="muted">Underfinanced:</span><span class="rose" id="s-under"></span></div>
    <div class="chip"><span class="muted">Overfinanced:</span><span class="sky" id="s-over"></span></div>
  </div>
</div></header>

<div class="wrap">

<section>
  <div class="eyebrow mono">Section 01 &middot; Capital Gap Matrix</div>
  <h2>Province &times; Sector X-Ray</h2>
  <div class="note">
    Negative score = economy outpaces credit (underfinanced). Positive = credit outpaces economy.
  </div>
  <div class="controls">
    <select id="f-prov"></select>
    <select id="f-sect"></select>
    <select id="f-sort">
      <option value="gap">Sort: most underfinanced</option>
      <option value="gapdesc">Sort: most overfinanced</option>
      <option value="econ">Sort: economic momentum</option>
      <option value="fin">Sort: financing support</option>
    </select>
  </div>
  <div class="grid" id="grid"></div>
</section>

<section>
  <div class="eyebrow mono">Section 02 &middot; Why is this highlighted?</div>
  <h2 id="d-title"></h2>
  <div class="panel detail" style="margin-top:14px">
    <div>
      <div id="d-badge"></div>
      <div id="d-head" style="font-weight:650;color:#fff;margin:9px 0 7px;font-size:15px"></div>
      <div id="d-narr" style="font-size:13px;color:#cbd5e1"></div>
      <ul id="d-drivers"></ul>
      <div class="rec" id="d-rec"></div>
    </div>
    <div>
      <div class="mono" style="font-size:11px;color:#94a3b8;margin-bottom:9px">SUB-SCORES (0-100)</div>
      <div class="bars" id="d-bars"></div>
      <div class="mono" style="font-size:11px;color:#94a3b8;margin:16px 0 6px">ACTUALS 2015-2020</div>
      <div id="d-actuals"></div>
    </div>
  </div>
</section>

<section>
  <div class="eyebrow mono">Section 03 &middot; Strategic Allocation Engine</div>
  <h2>&euro;1,000,000 Regional Capital Simulator</h2>
  <div class="controls" id="obj-btns"></div>
  <div class="panel">
    <div id="alloc"></div>
    <div class="rec" id="alloc-why" style="background:#0c4a6e;border-color:#0369a1;color:#bae6fd"></div>
  </div>
</section>

<footer class="wrap">
  <div id="prov-line"></div>
  <div style="margin-top:5px">
    Offline demo build &middot; identical data to the full app &middot; explanations are
    deterministic templates (the Next.js build adds live Gemini generation).
  </div>
</footer>
</div>

<script>
const PAYLOAD = __DATA__;
const ROWS = PAYLOAD.cells, META = PAYLOAD.meta;
const $ = id => document.getElementById(id);
const fmt = n => n.toLocaleString('en-US');
const eur = n => '\\u20ac' + (n >= 1e6 ? (n/1e6).toFixed(1) + 'M' : fmt(Math.round(n)));

let selectedId = ROWS.find(r => r.id === 'milano-industria') ? 'milano-industria' : ROWS[0].id;
let objective = 'Underfinanced Areas';

const classOf = r => r.capitalGapScore <= -15 ? 'deficit'
                   : r.capitalGapScore >= 15 ? 'surplus' : 'balanced';
const verdictOf = r => r.capitalGapScore <= -15 ? 'DEFICIT_UNDERFINANCED'
                     : r.capitalGapScore >= 15 ? 'SURPLUS_OVERHEATED' : 'BALANCED_STABLE';

/* ---------- templated explanation (same contract as the Gemini route) ---------- */
function explain(r) {
  const s = r.subScores, raw = r.raw || {}, g = Math.abs(r.capitalGapScore);
  const v = verdictOf(r);
  if (v === 'DEFICIT_UNDERFINANCED') return {
    badge: ['b-def', 'FINANCING DEFICIT'],
    headline: `Capital gap in ${r.province} ${r.sector}`,
    narrative: `Economic momentum reaches ${r.economicMomentum}/100 while financing support sits at `
      + `${r.financingSupport}/100 - a ${g}-point deficit. Turnover grew `
      + `${raw.turnoverGrowthPct}%/yr while credit moved ${raw.creditGrowthPct}%/yr.`,
    drivers: [
      `Turnover growth scores ${s.turnoverGrowth}/100 against credit growth at ${s.creditGrowth}/100.`,
      `Deposit strength is ${s.depositStrength}/100 - local savings are available but not deployed here.`,
      `Liquidity (deposit cover of lending) at ${s.liquidity}/100 on ${fmt(raw.businesses)} active units.`,
    ],
    rec: 'Prime candidate for expanded origination or a targeted regional credit line.',
  };
  if (v === 'SURPLUS_OVERHEATED') return {
    badge: ['b-sur', 'CREDIT SURPLUS'],
    headline: `Credit outpacing activity in ${r.province} ${r.sector}`,
    narrative: `Financing support reaches ${r.financingSupport}/100 against economic momentum of `
      + `${r.economicMomentum}/100 - a ${g}-point surplus. Credit moved ${raw.creditGrowthPct}%/yr `
      + `while turnover moved ${raw.turnoverGrowthPct}%/yr.`,
    drivers: [
      `Credit growth scores ${s.creditGrowth}/100 versus turnover growth at ${s.turnoverGrowth}/100.`,
      `Business base growth is ${s.businessGrowth}/100 - lending is not tracking new formation.`,
      `Credit intensity stands at ${raw.creditIntensityPct}% of annual turnover.`,
    ],
    rec: 'Review concentration and debt-service coverage before further exposure.',
  };
  return {
    badge: ['b-bal', 'BALANCED'],
    headline: `Balanced allocation in ${r.province} ${r.sector}`,
    narrative: `Economic momentum (${r.economicMomentum}/100) tracks financing support `
      + `(${r.financingSupport}/100) within ${g} points.`,
    drivers: [
      `Turnover growth ${s.turnoverGrowth}/100 against credit growth ${s.creditGrowth}/100.`,
      `Liquidity at ${s.liquidity}/100 with deposit strength ${s.depositStrength}/100.`,
      `${fmt(raw.businesses)} active units, credit intensity ${raw.creditIntensityPct}% of turnover.`,
    ],
    rec: 'Maintain current exposure and monitoring cadence.',
  };
}

/* ---------- rules-based allocator (mirrors the React build) ---------- */
const PALETTE = ['#3b82f6', '#6366f1', '#8b5cf6', '#06b6d4'];
function score(r, obj) {
  if (obj === 'Underfinanced Areas') return -r.capitalGapScore;
  if (obj === 'Growth') return r.economicMomentum - 0.3 * r.financingSupport;
  if (obj === 'Low-Risk') return r.subScores.liquidity + r.subScores.depositStrength - Math.abs(r.capitalGapScore);
  return r.economicMomentum - Math.abs(r.capitalGapScore) * 0.2;
}
function allocate(obj) {
  let ranked = [...ROWS].sort((a, b) => score(b, obj) - score(a, obj));
  if (obj === 'Diversification') {
    const seen = new Set();
    ranked = ranked.filter(r => !seen.has(r.province) && seen.add(r.province));
  }
  const picked = ranked.slice(0, 4);
  const floor = score(picked[picked.length - 1], obj) - 10;
  const w = picked.map(r => Math.max(score(r, obj) - floor, 1));
  const sum = w.reduce((a, b) => a + b, 0);
  const lead = picked[0];
  const why = {
    'Underfinanced Areas': `Weighted to where momentum most exceeds financing. ${lead.province} ${lead.sector} leads with a ${Math.abs(lead.capitalGapScore)}-point deficit against ${lead.economicMomentum}/100 momentum.`,
    'Growth': `Weighted to the strongest real-economy signals. ${lead.province} ${lead.sector} pairs ${lead.economicMomentum}/100 momentum with turnover growth at ${lead.subScores.turnoverGrowth}/100.`,
    'Low-Risk': `Weighted to deposit-rich, balanced cells. ${lead.province} ${lead.sector} shows liquidity ${lead.subScores.liquidity}/100 and a gap of only ${Math.abs(lead.capitalGapScore)} points.`,
    'Diversification': `One position per province to limit concentration, led by ${lead.province} ${lead.sector} at ${lead.economicMomentum}/100 momentum.`,
  }[obj];
  return {
    slices: picked.map((r, i) => ({
      row: r, pct: (w[i] / sum) * 100,
      amount: Math.round(1e6 * (w[i] / sum) / 1000) * 1000,
      color: PALETTE[i % 4],
    })), why,
  };
}

/* ---------- render ---------- */
function barRow(label, val, color) {
  return `<div class="bar"><span class="muted mono">${label}</span>`
       + `<span class="track"><span class="fill" style="width:${val}%;background:${color}"></span></span>`
       + `<span class="mono" style="text-align:right">${val}</span></div>`;
}

function renderGrid() {
  const p = $('f-prov').value, s = $('f-sect').value, sort = $('f-sort').value;
  let rows = ROWS.filter(r => (p === 'ALL' || r.province === p) && (s === 'ALL' || r.sector === s));
  rows.sort((a, b) => sort === 'gap' ? a.capitalGapScore - b.capitalGapScore
                    : sort === 'gapdesc' ? b.capitalGapScore - a.capitalGapScore
                    : sort === 'econ' ? b.economicMomentum - a.economicMomentum
                    : b.financingSupport - a.financingSupport);
  $('grid').innerHTML = rows.map(r => {
    const c = classOf(r), neg = r.capitalGapScore < 0;
    const col = c === 'deficit' ? '#fb7185' : c === 'surplus' ? '#38bdf8' : '#94a3b8';
    return `<div class="card ${c} ${r.id === selectedId ? 'sel' : ''}" data-id="${r.id}">
      <div class="cardhead">
        <div><div class="prov">${r.province}</div><div class="sect">${r.sector}</div></div>
        <div style="text-align:right">
          <div class="gap" style="color:${col}">${neg ? '' : '+'}${r.capitalGapScore}</div>
          <div class="verdict mono" style="color:${col}">${c === 'deficit' ? 'deficit' : c === 'surplus' ? 'surplus' : 'balanced'}</div>
        </div>
      </div>
      <div class="bars">
        ${barRow('Economy', r.economicMomentum, '#34d399')}
        ${barRow('Financing', r.financingSupport, '#38bdf8')}
      </div></div>`;
  }).join('');
  document.querySelectorAll('.card').forEach(el =>
    el.onclick = () => { selectedId = el.dataset.id; renderGrid(); renderDetail(); });
}

function renderDetail() {
  const r = ROWS.find(x => x.id === selectedId), e = explain(r), s = r.subScores, raw = r.raw || {};
  $('d-title').textContent = `${r.province} \\u00b7 ${r.sector}`;
  $('d-badge').innerHTML = `<span class="badge ${e.badge[0]}">${e.badge[1]}</span>`;
  $('d-head').textContent = e.headline;
  $('d-narr').textContent = e.narrative;
  $('d-drivers').innerHTML = e.drivers.map(d => `<li>${d}</li>`).join('');
  $('d-rec').textContent = e.rec;
  $('d-bars').innerHTML = [
    ['Turnover', s.turnoverGrowth, '#34d399'], ['Business', s.businessGrowth, '#34d399'],
    ['Sector perf', s.sectorPerformance, '#34d399'], ['Credit', s.creditGrowth, '#38bdf8'],
    ['Deposits', s.depositStrength, '#38bdf8'], ['Liquidity', s.liquidity, '#38bdf8'],
  ].map(x => barRow(x[0], x[1], x[2])).join('');
  $('d-actuals').innerHTML = [
    ['Turnover growth', raw.turnoverGrowthPct + '%/yr'],
    ['Credit growth', raw.creditGrowthPct + '%/yr'],
    ['Business growth', raw.businessGrowthPct + '%/yr'],
    ['Turnover 2020', eur(raw.turnoverKEUR * 1000)],
    ['Loans 2020', eur(raw.loansKEUR * 1000)],
    ['Active units', fmt(raw.businesses)],
  ].map(kv => `<div class="kv"><span class="muted">${kv[0]}</span><span class="mono">${kv[1]}</span></div>`).join('');
}

function renderSim() {
  const { slices, why } = allocate(objective);
  $('alloc').innerHTML = slices.map(s => `<div class="alloc">
      <span class="swatch" style="background:${s.color}"></span>
      <span><b style="color:#fff">${s.row.province}</b> <span class="muted">${s.row.sector}</span></span>
      <span class="mono muted" style="font-size:11px">${Math.round(s.pct)}%</span>
      <span class="amt">${eur(s.amount)}</span></div>`).join('');
  $('alloc-why').textContent = why;
  document.querySelectorAll('#obj-btns button').forEach(b =>
    b.classList.toggle('active', b.textContent === objective));
}

/* ---------- init ---------- */
$('f-prov').innerHTML = ['ALL', ...META.provinces].map(p =>
  `<option value="${p}">${p === 'ALL' ? 'All provinces' : p}</option>`).join('');
$('f-sect').innerHTML = ['ALL', ...META.sectors].map(s =>
  `<option value="${s}">${s === 'ALL' ? 'All sectors' : s}</option>`).join('');
['f-prov', 'f-sect', 'f-sort'].forEach(id => $(id).onchange = renderGrid);

$('obj-btns').innerHTML = ['Underfinanced Areas', 'Growth', 'Low-Risk', 'Diversification']
  .map(o => `<button>${o}</button>`).join('');
document.querySelectorAll('#obj-btns button').forEach(b =>
  b.onclick = () => { objective = b.textContent; renderSim(); });

$('s-under').textContent = ROWS.filter(r => r.capitalGapScore <= -15).length + ' / ' + ROWS.length;
$('s-over').textContent = ROWS.filter(r => r.capitalGapScore >= 15).length + ' / ' + ROWS.length;
$('prov-line').textContent = 'Sources: ' + META.sources.credit + ' | ' + META.sources.economy;

renderGrid(); renderDetail(); renderSim();
</script>
</body>
</html>
"""


def main():
    payload = json.loads(DATA.read_text(encoding="utf-8"))
    html = PAGE.replace("__DATA__", json.dumps(payload, ensure_ascii=False))
    OUT.write_text(html, encoding="utf-8")
    print(f"wrote {OUT}  ({OUT.stat().st_size / 1024:.0f} KB, {len(payload['cells'])} cells)")


if __name__ == "__main__":
    main()
