#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { fetchWithAuth } from "./utils/fetchWithAuth.js";
import type {
  Campaign,
  AdGroup,
  Keyword,
  Stats,
  CampaignWithStats,
  CreateCampaignArgs,
  DeleteCampaignArgs,
  ListAdgroupsArgs,
  GetAdgroupArgs,
  CreateAdgroupArgs,
  ListKeywordsArgs,
  CreateKeywordArgs,
  GetStatsArgs,
  GetCampaignStatsArgs,
} from "./types.js";

const server = new Server(
  {
    name: "@packative/naver-searchad-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define all tools
const tools = [
  {
    name: "list_campaigns",
    description: "List all Naver SearchAd campaigns",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "create_campaign",
    description: "Create a new Naver SearchAd campaign",
    inputSchema: {
      type: "object" as const,
      properties: {
        name: {
          type: "string",
          description: "Campaign name",
        },
        campaignTp: {
          type: "string",
          description: "Campaign type (e.g., WEB_SITE, SHOPPING)",
        },
        customerId: {
          type: "string",
          description: "Customer ID",
        },
        dailyBudget: {
          type: "number",
          description: "Daily budget in KRW",
        },
        deliveryMethod: {
          type: "string",
          description: "Delivery method (STANDARD or ACCELERATED)",
        },
      },
      required: ["name", "campaignTp"],
    },
  },
  {
    name: "delete_campaign",
    description: "Delete a Naver SearchAd campaign",
    inputSchema: {
      type: "object" as const,
      properties: {
        campaignId: {
          type: "string",
          description: "Campaign ID to delete",
        },
      },
      required: ["campaignId"],
    },
  },
  {
    name: "list_adgroups",
    description: "List all ad groups, optionally filtered by campaign",
    inputSchema: {
      type: "object" as const,
      properties: {
        campaignId: {
          type: "string",
          description: "Optional: Campaign ID to filter ad groups",
        },
      },
      required: [],
    },
  },
  {
    name: "get_adgroup",
    description: "Get details of a specific ad group",
    inputSchema: {
      type: "object" as const,
      properties: {
        adgroupId: {
          type: "string",
          description: "Ad group ID",
        },
      },
      required: ["adgroupId"],
    },
  },
  {
    name: "create_adgroup",
    description: "Create a new ad group within a campaign",
    inputSchema: {
      type: "object" as const,
      properties: {
        nccCampaignId: {
          type: "string",
          description: "Campaign ID to create ad group in",
        },
        name: {
          type: "string",
          description: "Ad group name",
        },
        pcChannelId: {
          type: "string",
          description: "PC channel ID",
        },
        mobileChannelId: {
          type: "string",
          description: "Mobile channel ID",
        },
        bidAmt: {
          type: "number",
          description: "Bid amount in KRW",
        },
      },
      required: ["nccCampaignId", "name"],
    },
  },
  {
    name: "list_keywords",
    description: "List all keywords in an ad group",
    inputSchema: {
      type: "object" as const,
      properties: {
        adgroupId: {
          type: "string",
          description: "Ad group ID",
        },
      },
      required: ["adgroupId"],
    },
  },
  {
    name: "create_keyword",
    description: "Add a keyword to an ad group",
    inputSchema: {
      type: "object" as const,
      properties: {
        adgroupId: {
          type: "string",
          description: "Ad group ID",
        },
        keyword: {
          type: "string",
          description: "Keyword text",
        },
        bidAmt: {
          type: "number",
          description: "Bid amount in KRW",
        },
      },
      required: ["adgroupId", "keyword"],
    },
  },
  {
    name: "get_stats",
    description:
      "Get performance statistics for campaigns, ad groups, or keywords. Returns impressions, clicks, cost, conversions, etc.",
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
];

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    let result: unknown;

    switch (name) {
      case "list_campaigns": {
        const response = await fetchWithAuth<Campaign[]>("/ncc/campaigns");
        result = response.data;
        break;
      }

      case "create_campaign": {
        const typedArgs = args as unknown as CreateCampaignArgs;
        const campaign = {
          name: typedArgs.name,
          campaignTp: typedArgs.campaignTp,
          customerId: typedArgs.customerId,
          dailyBudget: typedArgs.dailyBudget,
          deliveryMethod: typedArgs.deliveryMethod,
        };
        const response = await fetchWithAuth<Campaign>(
          "/ncc/campaigns",
          "POST",
          campaign
        );
        result = response.data;
        break;
      }

      case "delete_campaign": {
        const typedArgs = args as unknown as DeleteCampaignArgs;
        const response = await fetchWithAuth<Campaign>(
          `/ncc/campaigns/${typedArgs.campaignId}`,
          "DELETE"
        );
        result = response.data;
        break;
      }

      case "list_adgroups": {
        const typedArgs = args as unknown as ListAdgroupsArgs;
        const endpoint = typedArgs.campaignId
          ? `/ncc/adgroups?nccCampaignId=${typedArgs.campaignId}`
          : `/ncc/adgroups`;
        const response = await fetchWithAuth<AdGroup[]>(endpoint);
        result = response.data;
        break;
      }

      case "get_adgroup": {
        const typedArgs = args as unknown as GetAdgroupArgs;
        const response = await fetchWithAuth<AdGroup>(
          `/ncc/adgroups/${typedArgs.adgroupId}`
        );
        result = response.data;
        break;
      }

      case "create_adgroup": {
        const typedArgs = args as unknown as CreateAdgroupArgs;
        const adgroup = {
          nccCampaignId: typedArgs.nccCampaignId,
          name: typedArgs.name,
          pcChannelId: typedArgs.pcChannelId,
          mobileChannelId: typedArgs.mobileChannelId,
          bidAmt: typedArgs.bidAmt,
        };
        const response = await fetchWithAuth<AdGroup>(
          "/ncc/adgroups",
          "POST",
          adgroup
        );
        result = response.data;
        break;
      }

      case "list_keywords": {
        const typedArgs = args as unknown as ListKeywordsArgs;
        const response = await fetchWithAuth<Keyword[]>(
          `/ncc/keywords?nccAdgroupId=${typedArgs.adgroupId}`
        );
        result = response.data;
        break;
      }

      case "create_keyword": {
        const typedArgs = args as unknown as CreateKeywordArgs;
        const keyword = {
          keyword: typedArgs.keyword,
          bidAmt: typedArgs.bidAmt,
        };
        const response = await fetchWithAuth<Keyword>(
          `/ncc/keywords?nccAdgroupId=${typedArgs.adgroupId}`,
          "POST",
          keyword
        );
        result = response.data;
        break;
      }

      case "get_stats": {
        const typedArgs = args as unknown as GetStatsArgs;
        const params = new URLSearchParams();

        if (typedArgs.id) {
          params.append("id", typedArgs.id);
        }
        if (typedArgs.ids && typedArgs.ids.length > 0) {
          params.append("ids", JSON.stringify(typedArgs.ids));
        }

        // Fields - default to common metrics
        const fields = typedArgs.fields || [
          "impCnt",
          "clkCnt",
          "salesAmt",
          "ctr",
          "cpc",
          "ccnt",
        ];
        params.append("fields", JSON.stringify(fields));

        // Date range
        if (typedArgs.timeRange) {
          params.append("timeRange", JSON.stringify(typedArgs.timeRange));
        } else if (typedArgs.datePreset) {
          params.append("datePreset", typedArgs.datePreset);
        } else {
          params.append("datePreset", "last30days");
        }

        // Time increment
        params.append("timeIncrement", typedArgs.timeIncrement || "allDays");

        // Breakdown
        if (typedArgs.breakdown) {
          params.append("breakdown", typedArgs.breakdown);
        }

        const response = await fetchWithAuth<Stats[]>(
          `/stats?${params.toString()}`
        );
        result = response.data;
        break;
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
          result = { message: "No active campaigns found", campaigns: [] };
          break;
        }

        // Build stats query
        const params = new URLSearchParams();
        params.append("ids", JSON.stringify(campaignIds));
        params.append(
          "fields",
          JSON.stringify([
            "impCnt",
            "clkCnt",
            "salesAmt",
            "ctr",
            "cpc",
            "ccnt",
            "crto",
            "convAmt",
          ])
        );

        if (typedArgs.startDate && typedArgs.endDate) {
          params.append(
            "timeRange",
            JSON.stringify({
              since: typedArgs.startDate,
              until: typedArgs.endDate,
            })
          );
        } else if (typedArgs.datePreset) {
          params.append("datePreset", typedArgs.datePreset);
        } else {
          params.append("datePreset", "last30days");
        }

        params.append("timeIncrement", "allDays");

        const statsResponse = await fetchWithAuth<Stats[]>(
          `/stats?${params.toString()}`
        );

        // Merge campaign info with stats
        const statsMap: Record<string, Stats> = {};
        if (Array.isArray(statsResponse.data)) {
          statsResponse.data.forEach((stat) => {
            statsMap[stat.id] = stat;
          });
        }

        result = activeCampaigns.map(
          (campaign): CampaignWithStats => ({
            ...campaign,
            stats: statsMap[campaign.nccCampaignId] || null,
          })
        );
        break;
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    const err = error as Error & { response?: { data?: { message?: string } } };
    const errorMessage = err.response?.data?.message || err.message;
    return {
      content: [
        {
          type: "text" as const,
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Naver SearchAd MCP server running on stdio");
}

main().catch((error: Error) => {
  console.error("Server error:", error);
  process.exit(1);
});
