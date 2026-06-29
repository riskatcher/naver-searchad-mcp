import { fetchWithAuth } from "./fetchWithAuth.js";

// Shared helpers for the asynchronous Naver report APIs (stat-reports and
// master-reports). Both follow the same lifecycle: POST to create a job, poll
// GET /{kind}-reports/{id} until the job reaches a terminal status, then GET
// /report-download?authtoken=... to fetch the TSV result.

export type ReportKind = "stat" | "master";

export interface ReportJob {
  reportJobId?: string;
  id?: string;
  status?: string;
  downloadUrl?: string;
  [key: string]: unknown;
}

// Statuses that mean the job will not progress further. BUILT = ready to
// download; NONE = completed but no data for the requested range; ERROR = failed.
const TERMINAL_STATUSES = new Set(["BUILT", "NONE", "ERROR", "DONE", "FAILED"]);

const REPORT_BASE: Record<ReportKind, string> = {
  stat: "/stat-reports",
  master: "/master-reports",
};

export function reportJobId(job: ReportJob): string | undefined {
  return job.reportJobId ?? job.id;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Poll a report job until it reaches a terminal status, a download URL appears,
 * or the timeout elapses. Returns the last job payload seen — the caller should
 * inspect `status`/`downloadUrl` to decide what happened (e.g. a non-terminal
 * status means it timed out).
 */
export async function pollReportJob(
  kind: ReportKind,
  jobId: string,
  { timeoutMs = 60000, pollMs = 2500 }: { timeoutMs?: number; pollMs?: number } = {}
): Promise<ReportJob> {
  const base = REPORT_BASE[kind];
  const deadline = Date.now() + timeoutMs;
  let last: ReportJob = {};
  for (;;) {
    const res = await fetchWithAuth<ReportJob>(
      `${base}/${encodeURIComponent(jobId)}`
    );
    last = res.data ?? {};
    const status = String(last.status ?? "").toUpperCase();
    if (last.downloadUrl || TERMINAL_STATUSES.has(status)) {
      return last;
    }
    if (Date.now() >= deadline) {
      return last;
    }
    await sleep(pollMs);
  }
}

/** Split a download URL into the signable path and its query parameters. */
function parseDownloadTarget(downloadUrl: string): {
  path: string;
  params: Record<string, string>;
} {
  const params: Record<string, string> = {};
  try {
    const u = new URL(downloadUrl);
    for (const [k, v] of u.searchParams.entries()) params[k] = v;
    return { path: u.pathname, params };
  } catch {
    // Relative URL (e.g. "/report-download?authtoken=...").
    const [path, query] = downloadUrl.split("?");
    if (query) {
      for (const [k, v] of new URLSearchParams(query).entries()) params[k] = v;
    }
    return { path: path || "/report-download", params };
  }
}

/** Download the TSV body for a completed report job from its downloadUrl. */
export async function downloadReportTsv(downloadUrl: string): Promise<string> {
  const { path, params } = parseDownloadTarget(downloadUrl);
  const res = await fetchWithAuth<string>(
    path,
    "GET",
    undefined,
    params,
    "text"
  );
  return typeof res.data === "string" ? res.data : String(res.data ?? "");
}

/**
 * Parse Naver report TSV into rows of string cells. Naver report files have no
 * header row — columns are positional and defined by the report type's schema —
 * so this returns raw cell arrays; the caller may map them to named columns.
 */
export function parseTsv(text: string): string[][] {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => line.replace(/\r$/, ""))
    .filter((line) => line.length > 0)
    .map((line) => line.split("\t"));
}
