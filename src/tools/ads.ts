import { fetchWithAuth } from "../utils/fetchWithAuth.js";
import type {
  ToolDefinition,
  ToolResult,
  Ad,
  ListAdsArgs,
  GetAdArgs,
  CreateAdArgs,
  UpdateAdArgs,
  DeleteAdArgs,
} from "../types/index.js";
import { successResult, errorResult } from "../types/common.js";

export const toolDefinitions: ToolDefinition[] = [
  {
    name: "list_ads",
    description: "List all ads in an ad group",
    accessLevel: "read",
    inputSchema: {
      type: "object" as const,
      properties: {
        adgroupId: {
          type: "string",
          description: "Ad group ID to list ads for",
        },
      },
      required: ["adgroupId"],
    },
  },
  {
    name: "get_ad",
    description: "Get details of a specific ad",
    accessLevel: "read",
    inputSchema: {
      type: "object" as const,
      properties: {
        adId: {
          type: "string",
          description: "Ad ID",
        },
      },
      required: ["adId"],
    },
  },
  {
    name: "create_ad",
    description: "Create a new ad (creative) in an ad group",
    accessLevel: "write",
    inputSchema: {
      type: "object" as const,
      properties: {
        nccAdgroupId: {
          type: "string",
          description: "Ad group ID to create the ad in",
        },
        type: {
          type: "string",
          description:
            "Ad type (e.g., TEXT_45, CATALOG_PRODUCT, SHOPPING_PRODUCT_AD, etc.)",
        },
        ad: {
          type: "object",
          description:
            "Ad creative content. Structure varies by type. For TEXT_45: { pc: { final: 'url' }, mobile: { final: 'url' }, headline: '...', description: '...' }",
        },
        adAttr: {
          type: "object",
          description: "Additional ad attributes (optional, depends on ad type)",
        },
        userLock: {
          type: "boolean",
          description: "Whether the ad is paused (true) or active (false)",
        },
      },
      required: ["nccAdgroupId", "type", "ad"],
    },
  },
  {
    name: "update_ad",
    description: "Update an existing ad",
    accessLevel: "write",
    inputSchema: {
      type: "object" as const,
      properties: {
        adId: {
          type: "string",
          description: "Ad ID to update",
        },
        userLock: {
          type: "boolean",
          description: "Whether to pause (true) or enable (false) the ad",
        },
        inspectRequestMsg: {
          type: "string",
          description: "Message for inspection request",
        },
        ad: {
          type: "object",
          description: "Updated ad creative content",
        },
        adAttr: {
          type: "object",
          description: "Updated ad attributes",
        },
      },
      required: ["adId"],
    },
  },
  {
    name: "delete_ad",
    description: "Delete an ad",
    accessLevel: "delete",
    inputSchema: {
      type: "object" as const,
      properties: {
        adId: {
          type: "string",
          description: "Ad ID to delete",
        },
      },
      required: ["adId"],
    },
  },
];

export async function handleTool(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult | null> {
  switch (name) {
    case "list_ads": {
      const { adgroupId } = args as unknown as ListAdsArgs;
      if (!adgroupId) return errorResult("adgroupId is required");
      const response = await fetchWithAuth<Ad[]>(
        "/ncc/ads",
        "GET",
        undefined,
        { nccAdgroupId: adgroupId }
      );
      return successResult(response.data);
    }

    case "get_ad": {
      const { adId } = args as unknown as GetAdArgs;
      if (!adId) return errorResult("adId is required");
      const response = await fetchWithAuth<Ad>(
        `/ncc/ads/${encodeURIComponent(adId)}`
      );
      return successResult(response.data);
    }

    case "create_ad": {
      const typedArgs = args as unknown as CreateAdArgs;
      if (!typedArgs.nccAdgroupId || !typedArgs.type || !typedArgs.ad) {
        return errorResult("nccAdgroupId, type, and ad are required");
      }
      const body: Record<string, unknown> = {
        nccAdgroupId: typedArgs.nccAdgroupId,
        type: typedArgs.type,
        ad: typedArgs.ad,
      };
      if (typedArgs.adAttr !== undefined) body.adAttr = typedArgs.adAttr;
      if (typedArgs.userLock !== undefined) body.userLock = typedArgs.userLock;

      const response = await fetchWithAuth<Ad>("/ncc/ads", "POST", body);
      return successResult(response.data);
    }

    case "update_ad": {
      const typedArgs = args as unknown as UpdateAdArgs;
      if (!typedArgs.adId) return errorResult("adId is required");

      const body: Record<string, unknown> = {};
      if (typedArgs.userLock !== undefined) body.userLock = typedArgs.userLock;
      if (typedArgs.inspectRequestMsg !== undefined)
        body.inspectRequestMsg = typedArgs.inspectRequestMsg;
      if (typedArgs.ad !== undefined) body.ad = typedArgs.ad;
      if (typedArgs.adAttr !== undefined) body.adAttr = typedArgs.adAttr;

      const response = await fetchWithAuth<Ad>(
        `/ncc/ads/${encodeURIComponent(typedArgs.adId)}`,
        "PUT",
        body
      );
      return successResult(response.data);
    }

    case "delete_ad": {
      const { adId } = args as unknown as DeleteAdArgs;
      if (!adId) return errorResult("adId is required");
      const response = await fetchWithAuth<Ad>(
        `/ncc/ads/${encodeURIComponent(adId)}`,
        "DELETE"
      );
      return successResult(response.data);
    }

    default:
      return null;
  }
}
