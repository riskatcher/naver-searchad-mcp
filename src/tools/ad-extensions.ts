import { fetchWithAuth } from "../utils/fetchWithAuth.js";
import type {
  ToolDefinition,
  ToolResult,
  AdExtension,
  ListAdExtensionsArgs,
  CreateAdExtensionArgs,
  DeleteAdExtensionArgs,
} from "../types/index.js";
import { successResult, errorResult } from "../types/common.js";

export const toolDefinitions: ToolDefinition[] = [
  {
    name: "list_ad_extensions",
    description: "List ad extensions for an ad group (sitelinks, callouts, etc.)",
    accessLevel: "read",
    inputSchema: {
      type: "object" as const,
      properties: {
        adgroupId: {
          type: "string",
          description: "Ad group ID to list extensions for",
        },
      },
      required: ["adgroupId"],
    },
  },
  {
    name: "create_ad_extension",
    description: "Create a new ad extension (sitelink, callout, etc.)",
    accessLevel: "write",
    inputSchema: {
      type: "object" as const,
      properties: {
        nccAdgroupId: {
          type: "string",
          description: "Ad group ID to attach the extension to",
        },
        type: {
          type: "string",
          description:
            "Extension type (e.g., SITELINK, CALLOUT, STRUCTURED_SNIPPET, CALL, LOCATION, APP, PRICE)",
        },
        values: {
          type: "object",
          description:
            "Extension values. Structure varies by type. For SITELINK: { sitelinks: [{ text: '...', finalUrl: '...' }] }",
        },
      },
      required: ["nccAdgroupId", "type", "values"],
    },
  },
  {
    name: "delete_ad_extension",
    description: "Delete an ad extension",
    accessLevel: "delete",
    inputSchema: {
      type: "object" as const,
      properties: {
        adExtensionId: {
          type: "string",
          description: "Ad extension ID to delete",
        },
      },
      required: ["adExtensionId"],
    },
  },
];

export async function handleTool(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult | null> {
  switch (name) {
    case "list_ad_extensions": {
      const { adgroupId } = args as unknown as ListAdExtensionsArgs;
      if (!adgroupId) return errorResult("adgroupId is required");
      const response = await fetchWithAuth<AdExtension[]>(
        "/ncc/ad-extensions",
        "GET",
        undefined,
        { nccAdgroupId: adgroupId }
      );
      return successResult(response.data);
    }

    case "create_ad_extension": {
      const typedArgs = args as unknown as CreateAdExtensionArgs;
      if (!typedArgs.nccAdgroupId || !typedArgs.type || !typedArgs.values) {
        return errorResult("nccAdgroupId, type, and values are required");
      }
      const body: Record<string, unknown> = {
        nccAdgroupId: typedArgs.nccAdgroupId,
        type: typedArgs.type,
        values: typedArgs.values,
      };
      const response = await fetchWithAuth<AdExtension>(
        "/ncc/ad-extensions",
        "POST",
        body
      );
      return successResult(response.data);
    }

    case "delete_ad_extension": {
      const { adExtensionId } = args as unknown as DeleteAdExtensionArgs;
      if (!adExtensionId) return errorResult("adExtensionId is required");
      const response = await fetchWithAuth<AdExtension>(
        `/ncc/ad-extensions/${encodeURIComponent(adExtensionId)}`,
        "DELETE"
      );
      return successResult(response.data);
    }

    default:
      return null;
  }
}
