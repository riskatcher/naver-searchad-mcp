import { fetchWithAuth } from "../utils/fetchWithAuth.js";
import type {
  ToolDefinition,
  ToolResult,
  KeywordSuggestion,
  EstimatePerformance,
  EstimateMedianBid,
  GetKeywordSuggestionsArgs,
  GetEstimatePerformanceArgs,
  GetEstimateMedianBidArgs,
} from "../types/index.js";
import { successResult, errorResult } from "../types/common.js";

export const toolDefinitions: ToolDefinition[] = [
  {
    name: "get_keyword_suggestions",
    accessLevel: "read",
    description:
      "Get keyword suggestions and search volume data from Naver's keyword tool. Provides monthly search volume, click counts, CTR, and competition index.",
    inputSchema: {
      type: "object" as const,
      properties: {
        hintKeywords: {
          type: "array",
          items: { type: "string" },
          description: "Seed keywords to get suggestions for (max 5)",
        },
        showDetail: {
          type: "boolean",
          description: "Whether to show detailed metrics (default: true)",
        },
      },
      required: ["hintKeywords"],
    },
  },
  {
    name: "get_estimate_performance",
    accessLevel: "read",
    description:
      "Get estimated performance (impressions, clicks, cost) for keywords at given bid amounts",
    inputSchema: {
      type: "object" as const,
      properties: {
        device: {
          type: "string",
          description: "Device type: PC, MOBILE, or null for all",
        },
        keywordplus: {
          type: "boolean",
          description: "Whether to include keyword plus network",
        },
        key: {
          type: "string",
          description: "A single keyword to estimate",
        },
        bids: {
          type: "array",
          items: { type: "number" },
          description: "Bid amounts to estimate performance for",
        },
        keywords: {
          type: "array",
          items: { type: "string" },
          description: "Multiple keywords to estimate",
        },
      },
      required: [],
    },
  },
  {
    name: "get_estimate_median_bid",
    accessLevel: "read",
    description:
      "Get the estimated median bid amount for keywords to appear on the first page",
    inputSchema: {
      type: "object" as const,
      properties: {
        keywords: {
          type: "array",
          items: { type: "string" },
          description: "Keywords to get median bid estimates for",
        },
      },
      required: ["keywords"],
    },
  },
];

export async function handleTool(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult | null> {
  switch (name) {
    case "get_keyword_suggestions": {
      const typedArgs = args as unknown as GetKeywordSuggestionsArgs;
      if (
        !typedArgs.hintKeywords ||
        typedArgs.hintKeywords.length === 0
      ) {
        return errorResult("hintKeywords is required and must not be empty");
      }

      const params: Record<string, string> = {
        hintKeywords: typedArgs.hintKeywords.join(","),
        showDetail: String(typedArgs.showDetail !== false ? 1 : 0),
      };

      const response = await fetchWithAuth<{ keywordList: KeywordSuggestion[] }>(
        "/keywordstool",
        "GET",
        undefined,
        params
      );
      return successResult(response.data);
    }

    case "get_estimate_performance": {
      const typedArgs = args as unknown as GetEstimatePerformanceArgs;
      const params: Record<string, string> = {};

      if (typedArgs.device) params.device = typedArgs.device;
      if (typedArgs.keywordplus !== undefined)
        params.keywordplus = String(typedArgs.keywordplus);
      if (typedArgs.key) params.key = typedArgs.key;
      if (typedArgs.bids && typedArgs.bids.length > 0)
        params.bids = JSON.stringify(typedArgs.bids);
      if (typedArgs.keywords && typedArgs.keywords.length > 0)
        params.keywords = JSON.stringify(typedArgs.keywords);

      const response = await fetchWithAuth<EstimatePerformance[]>(
        "/estimate/performance/keyword",
        "GET",
        undefined,
        params
      );
      return successResult(response.data);
    }

    case "get_estimate_median_bid": {
      const typedArgs = args as unknown as GetEstimateMedianBidArgs;
      if (!typedArgs.keywords || typedArgs.keywords.length === 0) {
        return errorResult("keywords is required and must not be empty");
      }

      const params: Record<string, string> = {
        keywords: JSON.stringify(typedArgs.keywords),
      };

      const response = await fetchWithAuth<EstimateMedianBid[]>(
        "/estimate/median-bid/keyword",
        "GET",
        undefined,
        params
      );
      return successResult(response.data);
    }

    default:
      return null;
  }
}
