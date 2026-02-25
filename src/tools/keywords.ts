import { fetchWithAuth } from "../utils/fetchWithAuth.js";
import type {
  ToolDefinition,
  ToolResult,
  Keyword,
  ListKeywordsArgs,
  GetKeywordArgs,
  CreateKeywordArgs,
  UpdateKeywordArgs,
  DeleteKeywordArgs,
} from "../types/index.js";
import { successResult, errorResult } from "../types/common.js";

export const toolDefinitions: ToolDefinition[] = [
  {
    name: "list_keywords",
    description: "List all keywords in an ad group",
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
    name: "get_keyword",
    description: "Get details of a specific keyword",
    accessLevel: "read",
    inputSchema: {
      type: "object" as const,
      properties: {
        keywordId: {
          type: "string",
          description: "Keyword ID",
        },
      },
      required: ["keywordId"],
    },
  },
  {
    name: "create_keyword",
    description: "Add a keyword to an ad group",
    accessLevel: "write",
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
    name: "update_keyword",
    description: "Update a keyword (bid amount, status, etc.)",
    accessLevel: "write",
    inputSchema: {
      type: "object" as const,
      properties: {
        keywordId: {
          type: "string",
          description: "Keyword ID to update",
        },
        nccAdgroupId: {
          type: "string",
          description: "Ad group ID the keyword belongs to",
        },
        bidAmt: {
          type: "number",
          description: "New bid amount in KRW",
        },
        userLock: {
          type: "boolean",
          description: "Whether to pause (true) or enable (false) the keyword",
        },
        inspectStatus: {
          type: "string",
          description: "Inspect status",
        },
      },
      required: ["keywordId", "nccAdgroupId"],
    },
  },
  {
    name: "delete_keyword",
    description: "Delete a keyword",
    accessLevel: "delete",
    inputSchema: {
      type: "object" as const,
      properties: {
        keywordId: {
          type: "string",
          description: "Keyword ID to delete",
        },
      },
      required: ["keywordId"],
    },
  },
];

export async function handleTool(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult | null> {
  switch (name) {
    case "list_keywords": {
      const { adgroupId } = args as unknown as ListKeywordsArgs;
      if (!adgroupId) return errorResult("adgroupId is required");
      const response = await fetchWithAuth<Keyword[]>(
        "/ncc/keywords",
        "GET",
        undefined,
        { nccAdgroupId: adgroupId }
      );
      return successResult(response.data);
    }

    case "get_keyword": {
      const { keywordId } = args as unknown as GetKeywordArgs;
      if (!keywordId) return errorResult("keywordId is required");
      const response = await fetchWithAuth<Keyword>(
        `/ncc/keywords/${encodeURIComponent(keywordId)}`
      );
      return successResult(response.data);
    }

    case "create_keyword": {
      const typedArgs = args as unknown as CreateKeywordArgs;
      if (!typedArgs.adgroupId || !typedArgs.keyword) {
        return errorResult("adgroupId and keyword are required");
      }
      // Bug #2 fix: Naver API expects an ARRAY of keyword objects
      const keywordObj: Record<string, unknown> = {
        keyword: typedArgs.keyword,
      };
      if (typedArgs.bidAmt !== undefined) keywordObj.bidAmt = typedArgs.bidAmt;

      const response = await fetchWithAuth<Keyword>(
        "/ncc/keywords",
        "POST",
        [keywordObj],  // Wrap in array
        { nccAdgroupId: typedArgs.adgroupId }
      );
      return successResult(response.data);
    }

    case "update_keyword": {
      const typedArgs = args as unknown as UpdateKeywordArgs;
      if (!typedArgs.keywordId || !typedArgs.nccAdgroupId) {
        return errorResult("keywordId and nccAdgroupId are required");
      }

      const body: Record<string, unknown> = {
        nccKeywordId: typedArgs.keywordId,
        nccAdgroupId: typedArgs.nccAdgroupId,
      };
      if (typedArgs.bidAmt !== undefined) body.bidAmt = typedArgs.bidAmt;
      if (typedArgs.userLock !== undefined) body.userLock = typedArgs.userLock;
      if (typedArgs.inspectStatus !== undefined) body.inspectStatus = typedArgs.inspectStatus;

      const response = await fetchWithAuth<Keyword>(
        `/ncc/keywords/${encodeURIComponent(typedArgs.keywordId)}`,
        "PUT",
        body
      );
      return successResult(response.data);
    }

    case "delete_keyword": {
      const { keywordId } = args as unknown as DeleteKeywordArgs;
      if (!keywordId) return errorResult("keywordId is required");
      const response = await fetchWithAuth<Keyword>(
        `/ncc/keywords/${encodeURIComponent(keywordId)}`,
        "DELETE"
      );
      return successResult(response.data);
    }

    default:
      return null;
  }
}
