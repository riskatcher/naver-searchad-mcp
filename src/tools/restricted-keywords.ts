import { fetchWithAuth } from "../utils/fetchWithAuth.js";
import type {
  ToolDefinition,
  ToolResult,
  RestrictedKeyword,
  ListRestrictedKeywordsArgs,
  CreateRestrictedKeywordsArgs,
  DeleteRestrictedKeywordsArgs,
} from "../types/index.js";
import { successResult, errorResult } from "../types/common.js";

export const toolDefinitions: ToolDefinition[] = [
  {
    name: "list_restricted_keywords",
    accessLevel: "read",
    description:
      "List restricted keywords for an ad group. Restricted keywords limit automatic Keyword Plus expansion (distinct from negative keywords, which suppress matching of explicit search terms).",
    inputSchema: {
      type: "object" as const,
      properties: {
        adgroupId: {
          type: "string",
          description: "Ad group ID to list restricted keywords for",
        },
        type: {
          type: "string",
          description:
            "Optional filter by restriction type (e.g., KEYWORD_PLUS_RESTRICT).",
        },
      },
      required: ["adgroupId"],
    },
  },
  {
    name: "create_restricted_keywords",
    accessLevel: "write",
    description: "Add restricted keywords to an ad group.",
    inputSchema: {
      type: "object" as const,
      properties: {
        adgroupId: {
          type: "string",
          description: "Ad group ID to add restricted keywords to",
        },
        keywords: {
          type: "array",
          items: {
            type: "object",
            properties: {
              keyword: { type: "string", description: "Keyword text to restrict" },
              type: {
                type: "string",
                description:
                  "Restriction type (e.g., KEYWORD_PLUS_RESTRICT). Default: KEYWORD_PLUS_RESTRICT",
              },
            },
            required: ["keyword"],
          },
          description: "Array of restricted keywords to add",
        },
      },
      required: ["adgroupId", "keywords"],
    },
  },
  {
    name: "delete_restricted_keywords",
    accessLevel: "delete",
    description: "Delete restricted keywords from an ad group by their IDs.",
    inputSchema: {
      type: "object" as const,
      properties: {
        adgroupId: {
          type: "string",
          description: "Ad group ID the restricted keywords belong to",
        },
        ids: {
          type: "array",
          items: { type: "string" },
          description: "Array of restricted keyword IDs to delete",
        },
      },
      required: ["adgroupId", "ids"],
    },
  },
];

export async function handleTool(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult | null> {
  switch (name) {
    case "list_restricted_keywords": {
      const typedArgs = args as unknown as ListRestrictedKeywordsArgs;
      if (!typedArgs.adgroupId) return errorResult("adgroupId is required");
      const params: Record<string, string> = {};
      if (typedArgs.type) params.type = typedArgs.type;
      const response = await fetchWithAuth<RestrictedKeyword[]>(
        `/ncc/adgroups/${encodeURIComponent(typedArgs.adgroupId)}/restricted-keywords`,
        "GET",
        undefined,
        params
      );
      return successResult(response.data);
    }

    case "create_restricted_keywords": {
      const typedArgs = args as unknown as CreateRestrictedKeywordsArgs;
      if (!typedArgs.adgroupId) return errorResult("adgroupId is required");
      if (!typedArgs.keywords || typedArgs.keywords.length === 0) {
        return errorResult("keywords array is required and must not be empty");
      }
      const response = await fetchWithAuth<RestrictedKeyword[]>(
        `/ncc/adgroups/${encodeURIComponent(typedArgs.adgroupId)}/restricted-keywords`,
        "POST",
        typedArgs.keywords
      );
      return successResult(response.data);
    }

    case "delete_restricted_keywords": {
      const typedArgs = args as unknown as DeleteRestrictedKeywordsArgs;
      if (!typedArgs.adgroupId) return errorResult("adgroupId is required");
      if (!typedArgs.ids || typedArgs.ids.length === 0) {
        return errorResult("ids array is required and must not be empty");
      }
      const response = await fetchWithAuth<unknown>(
        `/ncc/adgroups/${encodeURIComponent(typedArgs.adgroupId)}/restricted-keywords`,
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
