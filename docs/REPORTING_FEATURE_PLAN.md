# Feature Plan: Reporting & Dashboard Layer

Status: **Proposed** · Owner: Packative · Last updated: 2026-06-29

## Context

This MCP server currently exposes the Naver SearchAd API as ~1:1 CRUD + stats
tools. A related open-source project,
[`hjsh200219/naver-ads-mcp`](https://github.com/hjsh200219/naver-ads-mcp),
takes a very different shape: instead of wrapping individual endpoints, it is a
**reporting pipeline** built almost entirely on the bulk report APIs
(`/stat-reports` and `/master-reports`). Its six tools turn raw report dumps
into audit workbooks, weekly stakeholder dashboards, and daily KPI-threshold
alerts.

We want to "clone" those capabilities on top of our existing, well-tested tool
base — without abandoning the CRUD design that makes this server useful for
day-to-day campaign management.

This document is the plan for that layer. The **report primitives it depends on
already landed** in this branch:

- Stat reports: `create_stat_report`, `get_stat_report`, `list_stat_reports`,
  `download_stat_report`, `delete_stat_report` (`src/tools/stats.ts`)
- Master reports: `create_master_report`, `get_master_report`,
  `list_master_reports`, `delete_master_report` (`src/tools/reports.ts`)

## Design principle: keep the server thin, let the model do the formatting

`hjsh200219/naver-ads-mcp` ships an Excel/HTML renderer inside the server
(`exceljs`-style dependencies, 10-sheet workbooks, HTML artifacts). That is a
lot of surface area and heavy dependencies for an MCP server.

**Recommended approach:** our reporting tools return **clean, aggregated JSON**
and let the host LLM (Claude) produce the human-facing artifact (a markdown
table, an HTML dashboard, a Canvas, etc.). This keeps the server dependency-light
and MCP-idiomatic, and it composes with whatever surface the user is in
(Claude Desktop, Slack, a doc). File generation becomes an *optional* later
phase, behind a flag, only if users specifically need shareable `.xlsx`/`.html`
files written to disk.

## The report polling primitive (shared helper)

Both stat and master reports are **asynchronous jobs**: create → poll until
`status` is built → fetch the `downloadUrl` (a signed URL) → parse TSV. Every
higher-level tool below needs this. Add one internal helper (not an MCP tool):

```
src/utils/reportJob.ts
  awaitReportJob(kind: "stat" | "master", create, { timeoutMs, pollMs }) -> rows
    1. POST create (reuse create_stat_report / create_master_report bodies)
    2. poll GET /{kind}-reports/{id} until status is terminal (BUILT/NONE/ERROR)
    3. on BUILT, download the TSV at downloadUrl and parse header+rows -> objects
```

Notes for implementation:
- `fetchWithAuth` (`src/utils/fetchWithAuth.ts`) currently forces the
  `https://api.naver.com` base and strips the path to the part it signs, so it
  **cannot fetch an absolute `downloadUrl`**. The helper needs a small
  `downloadReport(url)` that does a plain authenticated GET against the returned
  URL (the download URL carries its own auth token; confirm whether the standard
  `X-API-KEY`/signature headers are still required). This is the one piece of
  genuinely new transport code.
- TSV is gzipped in some report types — handle `Content-Encoding`/`.gz`.
- Respect Naver's per-account report-job cap by deleting jobs after download
  (we already expose `delete_*_report`).

## Phased tool plan

### Phase 1 — `fetch_report_data` (read) ✅ DONE
One tool that wraps "create + poll + download + parse" for a single report.

- Input: `kind` ("stat"|"master"), `reportTp`/`item`, `statDt`/`fromTime`,
  optional `columns`, `limit`, `maxWaitSeconds`, `cleanup`.
- Output: parsed rows as JSON (capped by `limit`; reports a `truncated` flag and
  `totalRows`). Columns are positional (no header in Naver TSV); `columns` maps
  cells to named fields.
- Implemented in `src/tools/reports.ts` (`fetch_report_data`) on top of the
  shared poll/download/parse helper `src/utils/reportJob.ts`, and
  `fetchWithAuth` gained a `responseType` argument so it can pull the TSV body.
- This is the analog of hjsh200219's `fetch_raw_data` and unblocks the rest.

### Phase 2 — `get_account_overview` (read)
Aggregation convenience over Phase 1 + existing `get_stats`.

- Pulls a date range of `AD`/`AD_DETAIL` stat reports, joins against master
  data (`Campaign`/`Adgroup`/`Keyword` names) so rows are human-readable.
- Returns KPI rollups (impressions, clicks, cost, conversions, CTR, CPC, ROAS)
  grouped by campaign / ad group / device.
- This is the data behind a "weekly dashboard" — but returned as JSON for the
  model to render.

### Phase 3 — `evaluate_kpi_thresholds` (read)
Analog of hjsh200219's `prepare_daily_dashboard`.

- Input: a small ruleset (e.g. `{ metric: "ror", op: "<", value: 200 }`) plus a
  date range.
- Output: the entities that violate each rule, ready for an alerting summary.
- Ruleset can default to a sensible starter set and be overridden per call.

### Phase 4 (optional) — file artifacts
Only if users need shareable files. Behind a build flag / separate entrypoint to
avoid forcing heavy deps on everyone.

- `generate_report_workbook` → writes an `.xlsx` (needs `exceljs`).
- `generate_html_dashboard` → writes a standalone `.html`.
- Both consume the JSON from Phases 2–3, so no new API logic.

## Multi-account consideration

hjsh200219 supports several advertiser accounts (one `CUSTOMER_ID` per client).
Our server reads a single `NAVER_CUSTOMER_ID` from the environment
(`src/utils/fetchWithAuth.ts`). If multi-account reporting is wanted, the
cleanest step is to let the report tools accept an optional `customerId`
override that flows into the `X-Customer` header, rather than re-architecting
auth. Track as a follow-up; not required for Phases 1–3 on a single account.

## Testing strategy

- Unit-test the TSV parser and `awaitReportJob` state machine with fixture
  payloads (no network), mirroring the existing `tests/fetchWithAuth.test.ts`
  style.
- Add tool-definition assertions in `tests/server.test.ts` for each new tool
  (counts + required fields), consistent with the current pattern.
- Manual end-to-end against a real account: create a `stat`/`AD` report for
  yesterday, confirm `fetch_report_data` returns parsed rows, then confirm the
  job is cleaned up via `delete_stat_report`.

## Out of scope / known gaps (from upstream)

- **Brand search area-level metrics** are not available via API (Naver only
  exposes them in the UI). Any brand-search dashboard fields would be manual —
  same limitation hjsh200219 documents.
- Report retention windows differ per `reportTp` (45/120/180/365 days). Long
  histories require scheduled daily collection, which is a host/cron concern,
  not something the MCP server should own.
