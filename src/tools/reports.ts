import { fetchWithAuth } from "../utils/fetchWithAuth.js";
import {
  pollReportJob,
  reportJobId,
  downloadReportTsv,
  parseTsv,
  type ReportJob,
} from "../utils/reportJob.js";
import type {
  ToolDefinition,
  ToolResult,
  MasterReportJob,
  CreateMasterReportArgs,
  GetMasterReportArgs,
  DeleteMasterReportArgs,
  FetchReportDataArgs,
} from "../types/index.js";
import { successResult, errorResult } from "../types/common.js";

export const toolDefinitions: ToolDefinition[] = [
  {
    name: "create_master_report",
    accessLevel: "write",
    description:
      "Create an asynchronous master report job. A master report is a bulk TSV snapshot of account ENTITIES (campaigns, ad groups, keywords, ads, etc.) — not performance statistics. Poll get_master_report for status and use the returned downloadUrl to fetch the result. For performance metrics use create_stat_report instead.",
    inputSchema: {
      type: "object" as const,
      properties: {
        item: {
          type: "string",
          description:
            "Entity type to export. Valid values include: Campaign, CampaignBudget, BusinessChannel, Adgroup, AdgroupBudget, Keyword, Ad, AdExtension, Qi, Label, LabelRef, Media, ProductGroup, ProductGroupRel, ContentsAd, Criterion, SharedBudget, Asset, AdAssetLink.",
        },
        fromTime: {
          type: "string",
          description:
            "Optional. When provided (ISO 8601, e.g. 2024-01-01T00:00:00Z), requests a DELTA report containing only entities changed since this time. When omitted, requests a FULL snapshot.",
        },
      },
      required: ["item"],
    },
  },
  {
    name: "get_master_report",
    accessLevel: "read",
    description:
      "Get the status of a master report job. When status is BUILT, the response includes a downloadUrl for the TSV result.",
    inputSchema: {
      type: "object" as const,
      properties: {
        reportJobId: {
          type: "string",
          description: "Report job ID returned from create_master_report",
        },
      },
      required: ["reportJobId"],
    },
  },
  {
    name: "list_master_reports",
    accessLevel: "read",
    description:
      "List all master report jobs that currently exist for the account, with their status and download URLs.",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "delete_master_report",
    accessLevel: "delete",
    description:
      "Delete a master report job. Naver retains a limited number of report jobs per account, so deleting old jobs frees up slots.",
    inputSchema: {
      type: "object" as const,
      properties: {
        reportJobId: {
          type: "string",
          description: "Report job ID to delete",
        },
      },
      required: ["reportJobId"],
    },
  },
  {
    // Classified as "read": this is a data-retrieval convenience. The transient
    // report job it creates and deletes is an implementation detail, not a
    // mutation of advertiser state, so it stays available in read-only mode.
    name: "fetch_report_data",
    accessLevel: "read",
    description:
      "End-to-end report fetch: create a stat or master report job, poll until it is built, download the TSV, and return the parsed rows. Blocks until the report is ready (up to maxWaitSeconds). For kind='stat' provide reportTp + statDt; for kind='master' provide item (+ optional fromTime). Report files have no header row — columns are positional per the report type; pass 'columns' to map them to named fields.",
    inputSchema: {
      type: "object" as const,
      properties: {
        kind: {
          type: "string",
          description: "Which report API to use: 'stat' (performance) or 'master' (entities).",
        },
        reportTp: {
          type: "string",
          description: "Stat report type (required when kind='stat'), e.g. AD, AD_DETAIL.",
        },
        statDt: {
          type: "string",
          description: "Statistics date YYYY-MM-DD (required when kind='stat').",
        },
        item: {
          type: "string",
          description: "Master report entity (required when kind='master'), e.g. Campaign, Keyword.",
        },
        fromTime: {
          type: "string",
          description: "Optional. For kind='master', request a delta of entities changed since this ISO time.",
        },
        columns: {
          type: "array",
          items: { type: "string" },
          description: "Optional column names to map each positional TSV cell onto an object.",
        },
        limit: {
          type: "number",
          description: "Maximum rows to return (default 1000).",
        },
        maxWaitSeconds: {
          type: "number",
          description: "Maximum seconds to wait for the job to build (default 60).",
        },
        cleanup: {
          type: "boolean",
          description: "Delete the report job after downloading to free the per-account slot (default true).",
        },
      },
      required: ["kind"],
    },
  },
];

export async function handleTool(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult | null> {
  switch (name) {
    case "create_master_report": {
      const typedArgs = args as unknown as CreateMasterReportArgs;
      if (!typedArgs.item) return errorResult("item is required");

      const body: Record<string, unknown> = { item: typedArgs.item };
      if (typedArgs.fromTime !== undefined) body.fromTime = typedArgs.fromTime;

      const response = await fetchWithAuth<MasterReportJob>(
        "/master-reports",
        "POST",
        body
      );
      return successResult(response.data);
    }

    case "get_master_report": {
      const { reportJobId } = args as unknown as GetMasterReportArgs;
      if (!reportJobId) return errorResult("reportJobId is required");
      const response = await fetchWithAuth<MasterReportJob>(
        `/master-reports/${encodeURIComponent(reportJobId)}`
      );
      return successResult(response.data);
    }

    case "list_master_reports": {
      const response = await fetchWithAuth<MasterReportJob[]>("/master-reports");
      return successResult(response.data);
    }

    case "delete_master_report": {
      const { reportJobId: jobId } = args as unknown as DeleteMasterReportArgs;
      if (!jobId) return errorResult("reportJobId is required");
      const response = await fetchWithAuth<unknown>(
        `/master-reports/${encodeURIComponent(jobId)}`,
        "DELETE"
      );
      return successResult(response.data);
    }

    case "fetch_report_data": {
      const typedArgs = args as unknown as FetchReportDataArgs;
      const kind = typedArgs.kind;
      if (kind !== "stat" && kind !== "master") {
        return errorResult("kind must be 'stat' or 'master'");
      }

      // 1. Create the job (reuses the same endpoints/bodies as the standalone
      //    create_* tools).
      let createBody: Record<string, unknown>;
      let createPath: string;
      if (kind === "stat") {
        if (!typedArgs.reportTp || !typedArgs.statDt) {
          return errorResult(
            "reportTp and statDt are required when kind='stat'"
          );
        }
        createPath = "/stat-reports";
        createBody = { reportTp: typedArgs.reportTp, statDt: typedArgs.statDt };
      } else {
        if (!typedArgs.item) {
          return errorResult("item is required when kind='master'");
        }
        createPath = "/master-reports";
        createBody = { item: typedArgs.item };
        if (typedArgs.fromTime !== undefined) {
          createBody.fromTime = typedArgs.fromTime;
        }
      }

      const created = await fetchWithAuth<ReportJob>(
        createPath,
        "POST",
        createBody
      );
      const jobId = reportJobId(created.data ?? {});
      if (!jobId) {
        return errorResult(
          `Report job was created but no job id was returned: ${JSON.stringify(
            created.data
          )}`
        );
      }

      // 2. Poll until built (or timed out).
      const timeoutMs = Math.max(
        1,
        typedArgs.maxWaitSeconds ?? 60
      ) * 1000;
      const job = await pollReportJob(kind, jobId, { timeoutMs });
      const status = String(job.status ?? "").toUpperCase();

      // 3. Download + parse if a result is available.
      const limit = typedArgs.limit ?? 1000;
      let rows: unknown[] = [];
      let totalRows = 0;
      let note: string | undefined;

      if (job.downloadUrl) {
        const tsv = await downloadReportTsv(job.downloadUrl);
        const cells = parseTsv(tsv);
        totalRows = cells.length;
        const sliced = cells.slice(0, limit);
        rows = typedArgs.columns
          ? sliced.map((cellRow) => {
              const obj: Record<string, string> = {};
              typedArgs.columns!.forEach((name, i) => {
                obj[name] = cellRow[i] ?? "";
              });
              return obj;
            })
          : sliced;
      } else if (status === "NONE") {
        note = "Report built successfully but contained no data for the requested range.";
      } else if (status === "ERROR" || status === "FAILED") {
        note = "Report job failed on the Naver side (status ERROR).";
      } else {
        note = `Report job did not finish within ${
          timeoutMs / 1000
        }s (last status: ${job.status ?? "unknown"}). Re-run with a larger maxWaitSeconds, or poll get_${kind}_report manually.`;
      }

      // 4. Best-effort cleanup so we don't exhaust the per-account job slots.
      let cleanedUp = false;
      if (typedArgs.cleanup !== false) {
        try {
          await fetchWithAuth<unknown>(
            `${createPath}/${encodeURIComponent(jobId)}`,
            "DELETE"
          );
          cleanedUp = true;
        } catch {
          // Leave the job in place if deletion fails; not fatal.
          cleanedUp = false;
        }
      }

      return successResult({
        kind,
        reportJobId: jobId,
        status: job.status ?? null,
        rowCount: rows.length,
        totalRows,
        truncated: totalRows > rows.length,
        cleanedUp,
        ...(note ? { note } : {}),
        rows,
      });
    }

    default:
      return null;
  }
}
