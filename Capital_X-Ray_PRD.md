# Product Requirements Document: Capital X-Ray

**Event:** AI2B Games Hackathon — Milano Fintech Track
**Track keyword:** FinTech
**Team size:** 2-3
**Build window:** ~6 hours
**Tagline:** "See where money flows. Discover where capital may be missing."

---

## 1. Problem Statement

Banks and businesses operate on disconnected data. Credit institutions see lending and deposit flows; regional economic data shows business performance and growth. No single tool compares the two to answer a simple but important question: **is capital actually flowing to where economic strength is happening?**

Mismatches — provinces or sectors where the economy is thriving but financing lags, or where financing is abundant but economic activity is weak — represent either missed investment opportunity or misallocated risk. Banks, investment funds, and regional policymakers currently have no easy way to see these gaps.

## 2. Solution Overview

**Capital X-Ray** compares two public data sources — Banca d'Italia credit/deposit data and Regione Lombardia business/economic data — at the province × sector level to compute a **Capital Gap Score**: the difference between how strong a sector's economy is and how well-financed it is.

The app visualizes this gap in an "X-ray" style dashboard, lets a user ask "why is this highlighted?" for an AI-grounded explanation, and includes a "€1M Simulator" that recommends how a hypothetical capital allocation could be deployed based on a chosen investment objective.

## 3. Target Users / Buyers

- Regional banks assessing where to expand lending
- Investment funds/VCs scouting underfinanced but high-growth sectors
- Regional policymakers deciding where to direct support programs

## 4. Data Sources (Mandatory — per competition rules)

| Source | Role | Granularity needed |
|---|---|---|
| Banca d'Italia — Serie storiche del credito e depositi | Main dataset | Province-level, deposits + loans/credit, 3+ years |
| Open Data Lombardia / Unioncamere — Indicatori Economici delle Imprese | Supplementary dataset | Province × sector, business count/turnover/growth, 3+ years |

**Sector reconciliation:** The two sources use different sector classifications. A crosswalk is required:
- Istat ATECO → "branca di attività economica" table (aggregates to ~6 macro-sectors: Agricoltura, Industria, Costruzioni, Commercio, Alloggio e ristorazione, Altri servizi)
- Banca d'Italia sector code ↔ ATECO correspondence (circolare 140; BdI code = first 3 digits of ATECO)

**Target coverage:** 5 provinces (Milano, Brescia, Bergamo, Monza e Brianza, Varese), 3 years of data minimum.

## 5. Core Metric Definitions

**Capital Gap Score = Economic Momentum Score − Financing Support Score**

- **Economic Momentum** (0-100, normalized) = 0.4×Turnover Growth + 0.3×Business Growth + 0.3×Sector Performance
- **Financing Support** (0-100, normalized) = 0.5×Credit Growth + 0.3×Deposit Strength + 0.2×Liquidity

A large positive gap = underfinanced (economy outpacing credit). A large negative gap = overheated (financing outpacing real economic activity).

*Note: weights are a starting hypothesis, not empirically derived — treat as a tunable parameter and be ready to justify or sensitivity-test if asked.*

## 6. Features & Scope

### In scope for v1 (hackathon build)
1. **X-Ray Grid** — province × sector cards showing Economic Strength, Business Momentum, Credit Support, Liquidity as progress bars, plus the signed Capital Gap Score, sortable/filterable
2. **"Why is this highlighted?"** — AI-generated explanation grounded strictly in the row's actual computed sub-scores (not free-form)
3. **€1M Simulator** — user selects an investment objective (Growth / Low-Risk / Underfinanced / Diversification); app returns a rules-based capital allocation across top provinces/sectors matching that objective, with a short AI-generated rationale

### Explicitly out of scope for v1 (future work)
- Compare-two-areas view
- Full "what-if" simulator with adjustable weights
- 2D bubble map visualization

## 7. AI Feature Requirements

- **"Why" explanation:** must be templated so the model only receives the row's actual numeric sub-scores and is instructed to reference at least two of them explicitly. No free-association from raw data. Must have a pre-generated fallback for the live demo in case of API failure/latency.
- **€1M Simulator allocation logic:** rules-based allocator (score-and-rank by objective, allocate proportional to gap size within top-N), presented as AI-driven since it is adaptive to user input and dataset-grounded. Optional: use a real model call only to generate the narrative explanation of a rules-based allocation, not to compute the allocation itself.

## 8. Technical Approach

- **Data pipeline:** Python + pandas. Applies ATECO crosswalk, joins both datasets at province × macro-sector level, computes normalized sub-scores and Capital Gap Score, outputs static JSON/CSV.
- **Backend:** Lightweight Flask/FastAPI serving precomputed scores; no database required.
- **Frontend:** React (or plain HTML/JS), consuming the static JSON. Mock data structure isolated at the top of the app so it can be swapped for real pipeline output without touching UI code.
- **Fallback dataset:** A small hand-built synthetic dataset (10-15 rows), shaped identically to the real schema, used to unblock frontend/AI development in parallel with the real pipeline, and as a live-demo safety net.

## 9. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Sector taxonomy mismatch between datasets | Pre-built ATECO crosswalk table (see Section 4) |
| AI "why" feature producing ungrounded/incorrect explanations | Strict template constraining model to given numeric inputs only; pre-generated fallback text |
| 6-hour timeline too tight for both AI features | Synthetic fallback dataset built first; both AI features wired against it in parallel with real data pipeline |
| Banca d'Italia data may only be available at regional (not provincial) grain | Verify granularity early; fallback to sector-only or single-province comparison if needed |
| Arbitrary scoring weights challenged by judges | One-sentence justification per weight prepared in advance; optional equal-weight sensitivity check |

## 10. Build Timeline (6 hours)

| Time | Task |
|---|---|
| 0:00–1:30 | Data pipeline: crosswalk, join, scoring |
| 1:30–2:15 | Backend/frontend skeleton |
| 2:15–3:15 | X-Ray UI wired to real (or fallback) data |
| 3:15–4:00 | AI "why" feature |
| 4:00–4:45 | €1M Simulator |
| 4:45–5:15 | Polish |
| 5:15–5:45 | Pitch rehearsal |

## 11. Pitch Structure

1. Problem: banks vs. businesses data silos
2. Reveal Capital X-Ray
3. Live demo of X-ray on a real province/sector
4. AI "Why?" explanation
5. Hand judge the €1M Simulator
6. Close: one-line pitch + named buyer (banks, investment funds, regional policymakers)

## 12. Evaluation Criteria Alignment (0-10 pts each, 50 total)

| Criterion | How this project addresses it |
|---|---|
| Theme Adherence | Directly targets FinTech: wealth management / predictive scoring angle via capital gap detection |
| Data Usage | Visibly joins and derives new insight from both mandated datasets |
| Originality & Innovation | Derived "gap" metric, not a simple dashboard of existing numbers |
| Functionality & Integration | Working end-to-end pipeline → backend → interactive frontend with two AI-adaptive features |
| Presentation Quality | Structured pitch arc with live interactive demo moment (simulator) |

## 13. Open Questions / To Confirm Before Build

- [ ] Confirm exact province-level granularity is available in the Banca d'Italia extract (not just regional)
- [ ] Confirm final list of 5 target provinces and sectors based on actual data availability
- [ ] Confirm at least 3 overlapping years exist across both sources
- [ ] Decide final scoring weight justifications
- [ ] Decide whether €1M Simulator uses a real model call for narrative text or fully hardcoded rationale for v1
