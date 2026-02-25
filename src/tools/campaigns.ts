import { fetchWithAuth } from "../utils/fetchWithAuth.js";
import type {
  ToolDefinition,
  ToolResult,
  Campaign,
  CreateCampaignArgs,
  GetCampaignArgs,
  UpdateCampaignArgs,
  DeleteCampaignArgs,
} from "../types/index.js";
import { successResult, errorResult } from "../types/common.js";

export const toolDefinitions: ToolDefinition[] = [
  {
    name: "list_campaigns",
    description: "List all Naver SearchAd campaigns",
    accessLevel: "read",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "get_campaign",
    description: "Get details of a specific Naver SearchAd campaign",
    accessLevel: "read",
    inputSchema: {
      type: "object" as const,
      properties: {
        campaignId: {
          type: "string",
          description: "Campaign ID",
        },
      },
      required: ["campaignId"],
    },
  },
  {
    name: "create_campaign",
    description: "Create a new Naver SearchAd campaign",
    accessLevel: "write",
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
    name: "update_campaign",
    description: "Update an existing Naver SearchAd campaign",
    accessLevel: "write",
    inputSchema: {
      type: "object" as const,
      properties: {
        campaignId: {
          type: "string",
          description: "Campaign ID to update",
        },
        name: {
          type: "string",
          description: "New campaign name",
        },
        dailyBudget: {
          type: "number",
          description: "New daily budget in KRW",
        },
        useDailyBudget: {
          type: "boolean",
          description: "Whether to use daily budget",
        },
        deliveryMethod: {
          type: "string",
          description: "Delivery method (STANDARD or ACCELERATED)",
        },
        trackingMode: {
          type: "string",
          description: "Tracking mode",
        },
        userLock: {
          type: "boolean",
          description: "Whether to pause (true) or enable (false) the campaign",
        },
      },
      required: ["campaignId"],
    },
  },
  {
    name: "delete_campaign",
    description: "Delete a Naver SearchAd campaign",
    accessLevel: "delete",
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
];

export async function handleTool(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult | null> {
  switch (name) {
    case "list_campaigns": {
      const response = await fetchWithAuth<Campaign[]>("/ncc/campaigns");
      return successResult(response.data);
    }

    case "get_campaign": {
      const { campaignId } = args as unknown as GetCampaignArgs;
      if (!campaignId) return errorResult("campaignId is required");
      const response = await fetchWithAuth<Campaign>(
        `/ncc/campaigns/${encodeURIComponent(campaignId)}`
      );
      return successResult(response.data);
    }

    case "create_campaign": {
      const typedArgs = args as unknown as CreateCampaignArgs;
      if (!typedArgs.name || !typedArgs.campaignTp) {
        return errorResult("name and campaignTp are required");
      }
      const body: Record<string, unknown> = {
        name: typedArgs.name,
        campaignTp: typedArgs.campaignTp,
      };
      if (typedArgs.customerId !== undefined) body.customerId = typedArgs.customerId;
      if (typedArgs.dailyBudget !== undefined) body.dailyBudget = typedArgs.dailyBudget;
      if (typedArgs.deliveryMethod !== undefined) body.deliveryMethod = typedArgs.deliveryMethod;

      const response = await fetchWithAuth<Campaign>("/ncc/campaigns", "POST", body);
      return successResult(response.data);
    }

    case "update_campaign": {
      const typedArgs = args as unknown as UpdateCampaignArgs;
      if (!typedArgs.campaignId) return errorResult("campaignId is required");

      const body: Record<string, unknown> = {};
      if (typedArgs.name !== undefined) body.name = typedArgs.name;
      if (typedArgs.dailyBudget !== undefined) body.dailyBudget = typedArgs.dailyBudget;
      if (typedArgs.useDailyBudget !== undefined) body.useDailyBudget = typedArgs.useDailyBudget;
      if (typedArgs.deliveryMethod !== undefined) body.deliveryMethod = typedArgs.deliveryMethod;
      if (typedArgs.trackingMode !== undefined) body.trackingMode = typedArgs.trackingMode;
      if (typedArgs.userLock !== undefined) body.userLock = typedArgs.userLock;

      const response = await fetchWithAuth<Campaign>(
        `/ncc/campaigns/${encodeURIComponent(typedArgs.campaignId)}`,
        "PUT",
        body
      );
      return successResult(response.data);
    }

    case "delete_campaign": {
      const { campaignId } = args as unknown as DeleteCampaignArgs;
      if (!campaignId) return errorResult("campaignId is required");
      const response = await fetchWithAuth<Campaign>(
        `/ncc/campaigns/${encodeURIComponent(campaignId)}`,
        "DELETE"
      );
      return successResult(response.data);
    }

    default:
      return null;
  }
}
