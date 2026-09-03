import { fetchWithAuth } from "../utils/fetchWithAuth.js";
import type {
  ToolDefinition,
  ToolResult,
  KeywordSuggestion,
  KeywordSortBy,
  ShapedKeywordList,
  EstimatePerformance,
  EstimateMedianBid,
  GetKeywordSuggestionsArgs,
  GetEstimatePerformanceArgs,
  GetEstimateMedianBidArgs,
} from "../types/index.js";
import { successResult, errorResult } from "../types/common.js";

const DEFAULT_KEYWORD_LIMIT = 50;

/**
 * Naver's /keywordstool returns up to 1000 related keywords per call, which
 * overruns an MCP client's response budget. Cap it, defaulting from
 * NAVER_KEYWORD_DEFAULT_LIMIT so a client that sends no argument stays small.
 * An explicit 0 asks for every row.
 */
export function resolveKeywordLimit(limit: number | undefined): number {
  if (typeof limit === "number" && Number.isFinite(limit) && limit >= 0) {
    return Math.floor(limit);
  }
  const fromEnv = Number.parseInt(
    process.env.NAVER_KEYWORD_DEFAULT_LIMIT ?? "",
    10
  );
  return Number.isFinite(fromEnv) && fromEnv >= 0
    ? fromEnv
    : DEFAULT_KEYWORD_LIMIT;
}

/** Naver reports a volume under ten as the string "< 10". */
function volume(value: unknown): number {
  const parsed =
    typeof value === "number" ? value : Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

function sortValue(row: KeywordSuggestion, sortBy: KeywordSortBy): number {
  if (sortBy === "pc") return volume(row.monthlyPcQcCnt);
  if (sortBy === "mobile") return volume(row.monthlyMobileQcCnt);
  return volume(row.monthlyPcQcCnt) + volume(row.monthlyMobileQcCnt);
}

export function shapeKeywordList(
  rows: KeywordSuggestion[],
  options: { limit: number; sortBy?: KeywordSortBy }
): ShapedKeywordList {
  const sortBy = options.sortBy ?? "total";
  const ordered =
    sortBy === "none"
      ? [...rows]
      : [...rows].sort((a, b) => sortValue(b, sortBy) - sortValue(a, sortBy));
  const keywordList =
    options.limit > 0 ? ordered.slice(0, options.limit) : ordered;
  return {
    keywordList,
    totalCount: rows.length,
    returnedCount: keywordList.length,
    truncated: keywordList.length < rows.length,
    sortBy,
  };
}

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
        limit: {
          type: "number",
          description:
            "Maximum keywords to return. Naver returns up to 1000 per call, which overruns most response budgets. Defaults to NAVER_KEYWORD_DEFAULT_LIMIT (50 when unset). Pass 0 for every row.",
        },
        sortBy: {
          type: "string",
          enum: ["total", "pc", "mobile", "none"],
          description:
            "Order before the limit is applied: total (PC + mobile monthly volume, default), pc, mobile, or none to keep Naver's own order.",
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
      return successResult(
        shapeKeywordList(response.data.keywordList ?? [], {
          limit: resolveKeywordLimit(typedArgs.limit),
          sortBy: typedArgs.sortBy,
        })
      );
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
