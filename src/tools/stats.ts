import { fetchWithAuth } from "../utils/fetchWithAuth.js";
import type {
  ToolDefinition,
  ToolResult,
  Stats,
  Campaign,
  CampaignWithStats,
  GetStatsArgs,
  GetCampaignStatsArgs,
  CreateStatReportArgs,
  GetStatReportArgs,
  DownloadStatReportArgs,
  DeleteStatReportArgs,
} from "../types/index.js";
import { successResult, errorResult } from "../types/common.js";

export const toolDefinitions: ToolDefinition[] = [
  {
    name: "get_stats",
    accessLevel: "read",
    description:
      "Get performance statistics for campaigns, ad groups, or keywords. Returns impressions, clicks, cost, conversions, etc. At least one of 'id' or 'ids' is required.",
    inputSchema: {
      type: "object" as const,
      properties: {
        id: {
          type: "string",
          description: "Single ID (campaign, adgroup, or keyword ID)",
        },
        ids: {
          type: "array",
          items: { type: "string" },
          description: "Multiple IDs to query at once",
        },
        fields: {
          type: "array",
          items: { type: "string" },
          description:
            "Metrics to retrieve: impCnt, clkCnt, salesAmt, ctr, cpc, ccnt, crto, convAmt, ror, cpConv, avgRnk",
        },
        datePreset: {
          type: "string",
          description:
            "Predefined date range: today, yesterday, last7days, last30days, lastweek, lastmonth, lastquarter",
        },
        timeRange: {
          type: "object",
          properties: {
            since: { type: "string", description: "Start date (YYYY-MM-DD)" },
            until: { type: "string", description: "End date (YYYY-MM-DD)" },
          },
          description: "Custom date range (use instead of datePreset)",
        },
        timeIncrement: {
          type: "string",
          description: "Time granularity: 1 (daily) or allDays (summary)",
        },
        breakdown: {
          type: "string",
          description:
            "Breakdown dimension: pcMblTp (device), dayw (day of week), hh24 (hour), regnNo (region)",
        },
      },
      required: [],
    },
  },
  {
    name: "get_campaign_stats",
    accessLevel: "read",
    description: "Get performance statistics for all active campaigns",
    inputSchema: {
      type: "object" as const,
      properties: {
        startDate: {
          type: "string",
          description: "Start date (YYYY-MM-DD)",
        },
        endDate: {
          type: "string",
          description: "End date (YYYY-MM-DD)",
        },
        datePreset: {
          type: "string",
          description:
            "Or use preset: today, yesterday, last7days, last30days, lastweek, lastmonth, lastquarter",
        },
      },
      required: [],
    },
  },
  {
    name: "create_stat_report",
    accessLevel: "write",
    description:
      "Create an asynchronous stat (performance) report job for a single date. The report is generated in the background; poll get_stat_report for status and use the returned downloadUrl to fetch the TSV result. For entity master data (campaigns, ad groups, keywords) use create_master_report instead.",
    inputSchema: {
      type: "object" as const,
      properties: {
        reportTp: {
          type: "string",
          description:
            "Stat report type. Valid values include: AD, AD_DETAIL, AD_CONVERSION, AD_CONVERSION_DETAIL, EXPKEYWORD, EXPKEYWORD_DETAIL, SHOPPINGKEYWORD, SHOPPINGKEYWORD_DETAIL, SHOPPINGKEYWORD_CONVERSION_DETAIL, SHOPPINGBRANDPRODUCT, SHOPPINGBRANDPRODUCT_CONVERSION, BRND_CONTRACT.",
        },
        statDt: {
          type: "string",
          description:
            "Statistics date for the report (YYYY-MM-DD). The Naver stat-report API generates one report per day.",
        },
      },
      required: ["reportTp", "statDt"],
    },
  },
  {
    name: "get_stat_report",
    accessLevel: "read",
    description: "Get the status of an async stat report job",
    inputSchema: {
      type: "object" as const,
      properties: {
        reportJobId: {
          type: "string",
          description: "Report job ID returned from create_stat_report",
        },
      },
      required: ["reportJobId"],
    },
  },
  {
    name: "download_stat_report",
    accessLevel: "read",
    description: "Download a completed stat report",
    inputSchema: {
      type: "object" as const,
      properties: {
        reportJobId: {
          type: "string",
          description: "Report job ID to download",
        },
      },
      required: ["reportJobId"],
    },
  },
  {
    name: "list_stat_reports",
    accessLevel: "read",
    description:
      "List all stat report jobs that currently exist for the account, with their status and download URLs.",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "delete_stat_report",
    accessLevel: "delete",
    description:
      "Delete a stat report job. Naver retains a limited number of report jobs per account, so deleting old jobs frees up slots.",
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
    case "get_stats": {
      const typedArgs = args as unknown as GetStatsArgs;

      // Bug #3 fix: validate that at least id or ids is provided
      if (!typedArgs.id && (!typedArgs.ids || typedArgs.ids.length === 0)) {
        return errorResult(
          "At least one of 'id' or 'ids' is required for get_stats"
        );
      }

      // Build query params properly
      const params: Record<string, string> = {};

      if (typedArgs.id) {
        params.id = typedArgs.id;
      }
      if (typedArgs.ids && typedArgs.ids.length > 0) {
        // Bug #5 fix: pass ids as JSON array string
        params.ids = JSON.stringify(typedArgs.ids);
      }

      // Fields - default to common metrics, passed as JSON array string
      const fields = typedArgs.fields || [
        "impCnt",
        "clkCnt",
        "salesAmt",
        "ctr",
        "cpc",
        "ccnt",
      ];
      params.fields = JSON.stringify(fields);

      // Date range
      if (typedArgs.timeRange) {
        params.timeRange = JSON.stringify(typedArgs.timeRange);
      } else if (typedArgs.datePreset) {
        params.datePreset = typedArgs.datePreset;
      } else {
        params.datePreset = "last30days";
      }

      // Time increment
      params.timeIncrement = typedArgs.timeIncrement || "allDays";

      // Breakdown
      if (typedArgs.breakdown) {
        params.breakdown = typedArgs.breakdown;
      }

      const response = await fetchWithAuth<Stats[]>(
        "/stats",
        "GET",
        undefined,
        params
      );
      return successResult(response.data);
    }

    case "get_campaign_stats": {
      const typedArgs = args as unknown as GetCampaignStatsArgs;

      // First get all campaigns
      const campaignsResponse =
        await fetchWithAuth<Campaign[]>("/ncc/campaigns");
      const campaigns = campaignsResponse.data;

      // Filter to ELIGIBLE campaigns only
      const activeCampaigns = campaigns.filter(
        (c) => c.status === "ELIGIBLE"
      );
      const campaignIds = activeCampaigns.map((c) => c.nccCampaignId);

      if (campaignIds.length === 0) {
        return successResult({
          message: "No active campaigns found",
          campaigns: [],
        });
      }

      // Build stats query params
      const params: Record<string, string> = {};
      params.ids = JSON.stringify(campaignIds);
      params.fields = JSON.stringify([
        "impCnt",
        "clkCnt",
        "salesAmt",
        "ctr",
        "cpc",
        "ccnt",
        "crto",
        "convAmt",
      ]);

      if (typedArgs.startDate && typedArgs.endDate) {
        params.timeRange = JSON.stringify({
          since: typedArgs.startDate,
          until: typedArgs.endDate,
        });
      } else if (typedArgs.datePreset) {
        params.datePreset = typedArgs.datePreset;
      } else {
        params.datePreset = "last30days";
      }

      params.timeIncrement = "allDays";

      const statsResponse = await fetchWithAuth<Stats[]>(
        "/stats",
        "GET",
        undefined,
        params
      );

      // Merge campaign info with stats
      const statsMap: Record<string, Stats> = {};
      if (Array.isArray(statsResponse.data)) {
        statsResponse.data.forEach((stat) => {
          statsMap[stat.id] = stat;
        });
      }

      const result: CampaignWithStats[] = activeCampaigns.map((campaign) => ({
        ...campaign,
        stats: statsMap[campaign.nccCampaignId] || null,
      }));
      return successResult(result);
    }

    case "create_stat_report": {
      const typedArgs = args as unknown as CreateStatReportArgs;
      if (!typedArgs.reportTp) return errorResult("reportTp is required");
      if (!typedArgs.statDt) return errorResult("statDt is required");

      const body: Record<string, unknown> = {
        reportTp: typedArgs.reportTp,
        statDt: typedArgs.statDt,
      };

      const response = await fetchWithAuth<unknown>(
        "/stat-reports",
        "POST",
        body
      );
      return successResult(response.data);
    }

    case "list_stat_reports": {
      const response = await fetchWithAuth<unknown>("/stat-reports");
      return successResult(response.data);
    }

    case "delete_stat_report": {
      const { reportJobId } = args as unknown as DeleteStatReportArgs;
      if (!reportJobId) return errorResult("reportJobId is required");
      const response = await fetchWithAuth<unknown>(
        `/stat-reports/${encodeURIComponent(reportJobId)}`,
        "DELETE"
      );
      return successResult(response.data);
    }

    case "get_stat_report": {
      const { reportJobId } = args as unknown as GetStatReportArgs;
      if (!reportJobId) return errorResult("reportJobId is required");
      const response = await fetchWithAuth<unknown>(
        `/stat-reports/${encodeURIComponent(reportJobId)}`
      );
      return successResult(response.data);
    }

    case "download_stat_report": {
      const { reportJobId } = args as unknown as DownloadStatReportArgs;
      if (!reportJobId) return errorResult("reportJobId is required");
      const response = await fetchWithAuth<unknown>(
        `/stat-reports/download/${encodeURIComponent(reportJobId)}`
      );
      return successResult(response.data);
    }

    default:
      return null;
  }
}
