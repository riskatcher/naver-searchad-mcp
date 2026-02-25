import { fetchWithAuth } from "../utils/fetchWithAuth.js";
import type {
  ToolDefinition,
  ToolResult,
  NegativeKeyword,
  ListNegativeKeywordsArgs,
  CreateNegativeKeywordsArgs,
  DeleteNegativeKeywordsArgs,
} from "../types/index.js";
import { successResult, errorResult } from "../types/common.js";

export const toolDefinitions: ToolDefinition[] = [
  {
    name: "list_negative_keywords",
    accessLevel: "read",
    description:
      "List negative keywords for an ad group or campaign. Provide either adgroupId or campaignId.",
    inputSchema: {
      type: "object" as const,
      properties: {
        adgroupId: {
          type: "string",
          description: "Ad group ID to list negative keywords for",
        },
        campaignId: {
          type: "string",
          description: "Campaign ID to list negative keywords for",
        },
      },
      required: [],
    },
  },
  {
    name: "create_negative_keywords",
    accessLevel: "write",
    description:
      "Add negative keywords to an ad group or campaign. Provide either nccAdgroupId or nccCampaignId.",
    inputSchema: {
      type: "object" as const,
      properties: {
        nccAdgroupId: {
          type: "string",
          description: "Ad group ID to add negative keywords to",
        },
        nccCampaignId: {
          type: "string",
          description: "Campaign ID to add negative keywords to",
        },
        keywords: {
          type: "array",
          items: {
            type: "object",
            properties: {
              keyword: { type: "string", description: "Negative keyword text" },
              type: {
                type: "string",
                description: "Match type (EXACT or PHRASE). Default: EXACT",
              },
            },
            required: ["keyword"],
          },
          description: "Array of negative keywords to add",
        },
      },
      required: ["keywords"],
    },
  },
  {
    name: "delete_negative_keywords",
    accessLevel: "delete",
    description: "Delete negative keywords by their IDs",
    inputSchema: {
      type: "object" as const,
      properties: {
        ids: {
          type: "array",
          items: { type: "string" },
          description: "Array of negative keyword IDs to delete",
        },
      },
      required: ["ids"],
    },
  },
];

export async function handleTool(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult | null> {
  switch (name) {
    case "list_negative_keywords": {
      const typedArgs = args as unknown as ListNegativeKeywordsArgs;
      if (!typedArgs.adgroupId && !typedArgs.campaignId) {
        return errorResult(
          "At least one of adgroupId or campaignId is required"
        );
      }
      const params: Record<string, string> = {};
      if (typedArgs.adgroupId) params.nccAdgroupId = typedArgs.adgroupId;
      if (typedArgs.campaignId) params.nccCampaignId = typedArgs.campaignId;

      const response = await fetchWithAuth<NegativeKeyword[]>(
        "/ncc/negativekeywords",
        "GET",
        undefined,
        params
      );
      return successResult(response.data);
    }

    case "create_negative_keywords": {
      const typedArgs = args as unknown as CreateNegativeKeywordsArgs;
      if (!typedArgs.keywords || typedArgs.keywords.length === 0) {
        return errorResult("keywords array is required and must not be empty");
      }
      if (!typedArgs.nccAdgroupId && !typedArgs.nccCampaignId) {
        return errorResult(
          "At least one of nccAdgroupId or nccCampaignId is required"
        );
      }

      const params: Record<string, string> = {};
      if (typedArgs.nccAdgroupId) params.nccAdgroupId = typedArgs.nccAdgroupId;
      if (typedArgs.nccCampaignId) params.nccCampaignId = typedArgs.nccCampaignId;

      const response = await fetchWithAuth<NegativeKeyword[]>(
        "/ncc/negativekeywords",
        "POST",
        typedArgs.keywords,
        params
      );
      return successResult(response.data);
    }

    case "delete_negative_keywords": {
      const typedArgs = args as unknown as DeleteNegativeKeywordsArgs;
      if (!typedArgs.ids || typedArgs.ids.length === 0) {
        return errorResult("ids array is required and must not be empty");
      }

      const response = await fetchWithAuth<unknown>(
        "/ncc/negativekeywords",
        "DELETE",
        undefined,
        { ids: typedArgs.ids.join(",") }
      );
      return successResult(response.data);
    }

    default:
      return null;
  }
}
