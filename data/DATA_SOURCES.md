# Capital X-Ray data downloads

These files were downloaded from the official sources for the Capital X-Ray prototype.

## Main competition data

- `raw/banca_finanziamenti_raccolta.zip` — Banca d’Italia publication `STAFINRA`, financing and deposits by sectors and territories. It contains nested ZIP files for the individual cubes and the domain/structure metadata. The extracted copy is under `extracted/banca_finanziamenti_raccolta/`.
- `raw/banca_condizioni_credito.zip` — Banca d’Italia publication `STACORIS`, credit conditions and risk by sectors and territories. The extracted copy is under `extracted/banca_condizioni_credito/`.

## Economic context

- `raw/istat_frame_sbs_territoriale_2023_tavole.zip` — Istat Frame SBS territorial tables. The extracted Excel workbooks are under `extracted/istat_frame_sbs_2023/`, including provincial tables for 2015–2020 and the 2023 territorial tables.
- `raw/ecb_safe_main_series.zip` — ECB SAFE main series. The extracted workbook is under `extracted/ecb_safe_main_series/`. Use this as broader financing-context evidence; it is not a direct measurement for an individual Lombardy province.

## Auxiliary Lombardia download

- `raw/lombardia_imprese_attivita.csv` — Open Data Lombardia dataset `vccq-z86z`, “Imprese per sezione attività economica con ordinamento - Comuni Città Metropolitana di Milano”. Its metadata says it is a 2014 municipal business-count dataset, so it is retained as an auxiliary file and should not be treated as the final economic-performance dataset for Capital X-Ray.

## Official source pages

- Banca d’Italia: <https://dati.bancaditalia.it/dataset/statistiche-territoriali>
- Istat territorial Frame SBS 2023: <https://www.istat.it/tavole-di-dati/risultati-economici-delle-imprese-e-delle-multinazionali-a-livello-territoriale-anno-2023/>
- ECB SAFE data: <https://www.ecb.europa.eu/stats/ecb_surveys/safe/html/data.en.html>
- Lombardia open-data catalog: <https://www.dati.lombardia.it/browse?q=imprese>
