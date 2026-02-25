import { fetchWithAuth } from "../utils/fetchWithAuth.js";
import type {
  ToolDefinition,
  ToolResult,
  AdGroup,
  ListAdgroupsArgs,
  GetAdgroupArgs,
  CreateAdgroupArgs,
  UpdateAdgroupArgs,
  DeleteAdgroupArgs,
} from "../types/index.js";
import { successResult, errorResult } from "../types/common.js";

export const toolDefinitions: ToolDefinition[] = [
  {
    name: "list_adgroups",
    description: "List all ad groups, optionally filtered by campaign",
    accessLevel: "read",
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
    accessLevel: "read",
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
    accessLevel: "write",
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
    name: "update_adgroup",
    description: "Update an existing ad group",
    accessLevel: "write",
    inputSchema: {
      type: "object" as const,
      properties: {
        adgroupId: {
          type: "string",
          description: "Ad group ID to update",
        },
        name: {
          type: "string",
          description: "New ad group name",
        },
        bidAmt: {
          type: "number",
          description: "New bid amount in KRW",
        },
        pcChannelId: {
          type: "string",
          description: "PC channel ID",
        },
        mobileChannelId: {
          type: "string",
          description: "Mobile channel ID",
        },
        userLock: {
          type: "boolean",
          description: "Whether to pause (true) or enable (false) the ad group",
        },
        useDailyBudget: {
          type: "boolean",
          description: "Whether to use daily budget",
        },
        dailyBudget: {
          type: "number",
          description: "Daily budget in KRW",
        },
      },
      required: ["adgroupId"],
    },
  },
  {
    name: "delete_adgroup",
    description: "Delete an ad group",
    accessLevel: "delete",
    inputSchema: {
      type: "object" as const,
      properties: {
        adgroupId: {
          type: "string",
          description: "Ad group ID to delete",
        },
      },
      required: ["adgroupId"],
    },
  },
];

export async function handleTool(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult | null> {
  switch (name) {
    case "list_adgroups": {
      const typedArgs = args as unknown as ListAdgroupsArgs;
      const params: Record<string, string> = {};
      if (typedArgs.campaignId) {
        params.nccCampaignId = typedArgs.campaignId;
      }
      const response = await fetchWithAuth<AdGroup[]>(
        "/ncc/adgroups",
        "GET",
        undefined,
        Object.keys(params).length > 0 ? params : undefined
      );
      return successResult(response.data);
    }

    case "get_adgroup": {
      const { adgroupId } = args as unknown as GetAdgroupArgs;
      if (!adgroupId) return errorResult("adgroupId is required");
      const response = await fetchWithAuth<AdGroup>(
        `/ncc/adgroups/${encodeURIComponent(adgroupId)}`
      );
      return successResult(response.data);
    }

    case "create_adgroup": {
      const typedArgs = args as unknown as CreateAdgroupArgs;
      if (!typedArgs.nccCampaignId || !typedArgs.name) {
        return errorResult("nccCampaignId and name are required");
      }
      const body: Record<string, unknown> = {
        nccCampaignId: typedArgs.nccCampaignId,
        name: typedArgs.name,
      };
      if (typedArgs.pcChannelId !== undefined) body.pcChannelId = typedArgs.pcChannelId;
      if (typedArgs.mobileChannelId !== undefined) body.mobileChannelId = typedArgs.mobileChannelId;
      if (typedArgs.bidAmt !== undefined) body.bidAmt = typedArgs.bidAmt;

      const response = await fetchWithAuth<AdGroup>("/ncc/adgroups", "POST", body);
      return successResult(response.data);
    }

    case "update_adgroup": {
      const typedArgs = args as unknown as UpdateAdgroupArgs;
      if (!typedArgs.adgroupId) return errorResult("adgroupId is required");

      const body: Record<string, unknown> = {};
      if (typedArgs.name !== undefined) body.name = typedArgs.name;
      if (typedArgs.bidAmt !== undefined) body.bidAmt = typedArgs.bidAmt;
      if (typedArgs.pcChannelId !== undefined) body.pcChannelId = typedArgs.pcChannelId;
      if (typedArgs.mobileChannelId !== undefined) body.mobileChannelId = typedArgs.mobileChannelId;
      if (typedArgs.userLock !== undefined) body.userLock = typedArgs.userLock;
      if (typedArgs.useDailyBudget !== undefined) body.useDailyBudget = typedArgs.useDailyBudget;
      if (typedArgs.dailyBudget !== undefined) body.dailyBudget = typedArgs.dailyBudget;

      const response = await fetchWithAuth<AdGroup>(
        `/ncc/adgroups/${encodeURIComponent(typedArgs.adgroupId)}`,
        "PUT",
        body
      );
      return successResult(response.data);
    }

    case "delete_adgroup": {
      const { adgroupId } = args as unknown as DeleteAdgroupArgs;
      if (!adgroupId) return errorResult("adgroupId is required");
      const response = await fetchWithAuth<AdGroup>(
        `/ncc/adgroups/${encodeURIComponent(adgroupId)}`,
        "DELETE"
      );
      return successResult(response.data);
    }

    default:
      return null;
  }
}
