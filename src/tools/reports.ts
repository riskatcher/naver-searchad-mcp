import { fetchWithAuth } from "../utils/fetchWithAuth.js";
import type {
  ToolDefinition,
  ToolResult,
  MasterReportJob,
  CreateMasterReportArgs,
  GetMasterReportArgs,
  DeleteMasterReportArgs,
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
      const { reportJobId } = args as unknown as DeleteMasterReportArgs;
      if (!reportJobId) return errorResult("reportJobId is required");
      const response = await fetchWithAuth<unknown>(
        `/master-reports/${encodeURIComponent(reportJobId)}`,
        "DELETE"
      );
      return successResult(response.data);
    }

    default:
      return null;
  }
}
