"""Capital X-Ray - train the expected-credit benchmark model.

The Capital Gap Score in build_dataset.py comes from hand-picked PRD weights
(0.4/0.3/0.3 and 0.5/0.3/0.2). The PRD itself flags those as "a starting
hypothesis, not empirically derived". This script replaces the guesswork with a
supervised model fitted on the data:

    log(loans) ~ log(turnover) + log(businesses) + sector + year trend

Trained on the full province x sector x year panel (15 cells x 6 years = 90
rows), the prediction answers "how much credit does a province-sector with
these fundamentals normally receive?". The residual - actual minus expected -
is a *learned* capital gap:

    negative residual = receives LESS credit than its fundamentals predict
    positive residual = receives MORE credit than its fundamentals predict

Honest validation is leave-one-CELL-out: every fold holds out all six years of
one province x sector, so the reported R2 is the model predicting a cell it has
never seen, not interpolating between years of a cell it memorised.

Run:  python pipeline/train_model.py
Writes: web/model.json and capital-x-ray/lib/capital-model.ts
"""
import json
import math
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import LeaveOneGroupOut

ROOT = Path(__file__).resolve().parent.parent
DATA_JSON = ROOT / "web" / "data.json"
OUT_JSON = ROOT / "web" / "model.json"
OUT_TS = ROOT / "capital-x-ray" / "lib" / "capital-model.ts"

BASE_YEAR = 2015
# Anything beyond +/- this many standard deviations is called an anomaly.
ANOMALY_Z = 1.5


def load_panel(payload):
    """Flatten the 15 cells x 6 year series into one modelling frame."""
    rows = []
    for cell in payload["cells"]:
        for point in cell["series"]:
            rows.append(
                {
                    "cell": cell["id"],
                    "province": cell["province"],
                    "sector": cell["sector"],
                    "year": int(point["year"]),
                    "turnover": point["turnover_kEUR"],
                    "loans": point["loans_kEUR"],
                    "businesses": point["businesses"],
                }
            )
    df = pd.DataFrame(rows)
    # Logs are undefined at zero; these columns are strictly positive in the
    # real data, so this only guards against a future pipeline regression.
    return df[(df.turnover > 0) & (df.loans > 0) & (df.businesses > 0)].copy()


def design(df, sector_levels):
    """Feature matrix. Sector is one-hot with the first level as reference."""
    X = pd.DataFrame(
        {
            "log_turnover": np.log(df.turnover.values),
            "log_businesses": np.log(df.businesses.values),
            "year_trend": (df.year - BASE_YEAR).values.astype(float),
        },
        index=df.index,
    )
    for level in sector_levels[1:]:
        X[f"sector_{level}"] = (df.sector == level).astype(float).values
    return X


def r2(y, pred):
    return 1.0 - ((y - pred) ** 2).sum() / ((y - y.mean()) ** 2).sum()


def leave_one_cell_out(X, y, groups):
    """Out-of-sample prediction for every row, holding out a whole cell."""
    pred = np.zeros(len(y))
    for train_idx, test_idx in LeaveOneGroupOut().split(X, y, groups):
        fold = LinearRegression().fit(X.iloc[train_idx], y[train_idx])
        pred[test_idx] = fold.predict(X.iloc[test_idx])
    return pred


def train():
    payload = json.loads(DATA_JSON.read_text(encoding="utf-8"))
    df = load_panel(payload)
    sector_levels = sorted(df.sector.unique())

    X = design(df, sector_levels)
    y = np.log(df.loans.values)

    model = LinearRegression().fit(X, y)
    fitted = model.predict(X)
    resid = y - fitted

    # --- validation -------------------------------------------------------
    oos = leave_one_cell_out(X, y, df.cell.values)
    loco_r2 = r2(y, oos)
    in_r2 = r2(y, fitted)
    resid_sd = float(resid.std(ddof=len(X.columns) + 1))

    # Baselines, so the headline R2 can be defended rather than just quoted.
    sector_only = pd.get_dummies(df.sector, drop_first=True).astype(float)
    baseline_r2 = r2(y, leave_one_cell_out(sector_only, y, df.cell.values))
    # Same model against loans-per-business strips raw size out of the target,
    # proving the fit is not just "big province, big loan book".
    y_intensity = np.log((df.loans / df.businesses).values)
    intensity_r2 = r2(y_intensity, leave_one_cell_out(X, y_intensity, df.cell.values))

    # --- per-cell scores --------------------------------------------------
    df = df.assign(expected_log=fitted, resid=resid)
    raw = []
    for cell_id, g in df.groupby("cell"):
        latest = g.sort_values("year").iloc[-1]
        raw.append(
            {
                "id": cell_id,
                "province": latest.province,
                "sector": latest.sector,
                "actualLoansKEUR": round(float(latest.loans), 1),
                "expectedLoansKEUR": round(float(math.exp(latest.expected_log)), 1),
                "meanResid": float(g.resid.mean()),
            }
        )

    # Standardise against the spread of the CELL-level gaps, not the row-level
    # residual sd. The question the dashboard asks is "is this cell unusual
    # among the fifteen?", and residuals inside one cell are serially
    # correlated, so the row-level sd is the wrong yardstick and would understate
    # every z-score.
    cell_gap_sd = float(np.std([c["meanResid"] for c in raw], ddof=1))

    cells = []
    for cell in raw:
        mean_resid = cell.pop("meanResid")
        cells.append(
            {
                **cell,
                "residualLogPts": round(mean_resid, 4),
                # exp()-1 turns log points into a readable "receives X% more or
                # less credit than expected".
                "creditGapPct": round((math.exp(mean_resid) - 1.0) * 100.0, 1),
                "zScore": round(mean_resid / cell_gap_sd, 2),
            }
        )

    for cell in cells:
        cell["isAnomaly"] = bool(abs(cell["zScore"]) >= ANOMALY_Z)
        cell["verdict"] = (
            "UNDERFINANCED"
            if cell["zScore"] <= -ANOMALY_Z
            else "OVERFINANCED"
            if cell["zScore"] >= ANOMALY_Z
            else "IN_LINE"
        )
    cells.sort(key=lambda c: c["residualLogPts"])

    # How much the learned ranking agrees with the hand-weighted one.
    heuristic = {c["id"]: c["capitalGapScore"] for c in payload["cells"]}
    joined = pd.DataFrame(
        {
            "model": pd.Series({c["id"]: c["residualLogPts"] for c in cells}),
            "heuristic": pd.Series(heuristic),
        }
    ).dropna()
    agreement = float(joined.model.corr(joined.heuristic))

    artifact = {
        "meta": {
            "name": "Expected-Credit Benchmark",
            "target": "log(loans_kEUR)",
            "features": list(X.columns),
            "trainRows": int(len(df)),
            "cells": int(df.cell.nunique()),
            "years": sorted(int(v) for v in df.year.unique()),
            "baseYear": BASE_YEAR,
            "anomalyZ": ANOMALY_Z,
            "interpretation": (
                "Residual = actual minus model-expected lending. Negative means the "
                "cell receives less credit than peer cells with the same fundamentals. "
                "This is a peer benchmark, not a credit-risk or affordability model."
            ),
        },
        "metrics": {
            "inSampleR2": round(in_r2, 3),
            "leaveOneCellOutR2": round(loco_r2, 3),
            "sectorOnlyBaselineR2": round(baseline_r2, 3),
            "loansPerBusinessR2": round(intensity_r2, 3),
            "residualSdLogPts": round(resid_sd, 3),
            "typicalErrorPct": round((math.exp(resid_sd) - 1) * 100, 1),
            "cellGapSdLogPts": round(cell_gap_sd, 3),
            "agreementWithHeuristic": round(agreement, 3),
        },
        "coefficients": {
            name: round(float(coef), 4) for name, coef in zip(X.columns, model.coef_)
        },
        "intercept": round(float(model.intercept_), 4),
        "cells": cells,
    }

    OUT_JSON.write_text(json.dumps(artifact, indent=2), encoding="utf-8")

    ts = (
        "// GENERATED by pipeline/train_model.py - do not edit by hand.\n"
        "// Expected-credit benchmark: log(loans) ~ log(turnover) + log(businesses)\n"
        "//   + sector + year trend, fitted on the 15-cell x 6-year panel.\n"
        "// Negative creditGapPct = receives less credit than fundamentals predict.\n\n"
        f"export const MODEL_META = {json.dumps(artifact['meta'], indent=2)};\n\n"
        f"export const MODEL_METRICS = {json.dumps(artifact['metrics'], indent=2)};\n\n"
        f"export const MODEL_COEFFICIENTS = {json.dumps(artifact['coefficients'], indent=2)};\n\n"
        f"export const MODEL_CELLS = {json.dumps(artifact['cells'], indent=2)};\n\n"
        "export type ModelCell = (typeof MODEL_CELLS)[number];\n\n"
        "export const MODEL_BY_ID: Record<string, ModelCell> = Object.fromEntries(\n"
        "  MODEL_CELLS.map((c) => [c.id, c])\n"
        ");\n"
    )
    OUT_TS.write_text(ts, encoding="utf-8")

    print(f"panel: {len(df)} rows, {df.cell.nunique()} cells, {df.year.nunique()} years")
    print(f"in-sample R2            : {in_r2:.3f}")
    print(f"leave-one-cell-out R2   : {loco_r2:.3f}")
    print(f"sector-only baseline R2 : {baseline_r2:.3f}")
    print(f"loans-per-business R2   : {intensity_r2:.3f}  (size stripped out)")
    print(f"residual sd             : {resid_sd:.3f} log pts (~{(math.exp(resid_sd)-1)*100:.0f}% typical error)")
    print(f"agreement w/ heuristic  : {agreement:+.3f}")
    print(f"anomalies flagged       : {sum(c['isAnomaly'] for c in cells)} / {len(cells)}")
    print(f"wrote {OUT_JSON.relative_to(ROOT)} and {OUT_TS.relative_to(ROOT)}")


if __name__ == "__main__":
    train()
