import { fetchWithAuth } from "../utils/fetchWithAuth.js";
import type {
  ToolDefinition,
  ToolResult,
  Bizmoney,
  BizmoneyHistory,
  BizmoneyCost,
  GetBizmoneyHistoriesArgs,
  GetBizmoneyCostArgs,
} from "../types/index.js";
import { successResult, errorResult } from "../types/common.js";

export const toolDefinitions: ToolDefinition[] = [
  {
    name: "get_bizmoney",
    description: "Get current bizmoney (ad budget) balance and status",
    accessLevel: "read",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "get_bizmoney_histories",
    description: "Get bizmoney transaction history (charges, refunds, etc.)",
    accessLevel: "read",
    inputSchema: {
      type: "object" as const,
      properties: {
        searchStartDt: {
          type: "string",
          description: "Start date for history search (YYYY-MM-DD)",
        },
        searchEndDt: {
          type: "string",
          description: "End date for history search (YYYY-MM-DD)",
        },
      },
      required: [],
    },
  },
  {
    name: "get_bizmoney_cost",
    description: "Get bizmoney cost breakdown by date and device",
    accessLevel: "read",
    inputSchema: {
      type: "object" as const,
      properties: {
        searchStartDt: {
          type: "string",
          description: "Start date (YYYY-MM-DD)",
        },
        searchEndDt: {
          type: "string",
          description: "End date (YYYY-MM-DD)",
        },
      },
      required: [],
    },
  },
];

export async function handleTool(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult | null> {
  switch (name) {
    case "get_bizmoney": {
      const response = await fetchWithAuth<Bizmoney>("/billing/bizmoney");
      return successResult(response.data);
    }

    case "get_bizmoney_histories": {
      const typedArgs = args as unknown as GetBizmoneyHistoriesArgs;
      const params: Record<string, string> = {};
      if (typedArgs.searchStartDt) params.searchStartDt = typedArgs.searchStartDt;
      if (typedArgs.searchEndDt) params.searchEndDt = typedArgs.searchEndDt;

      const response = await fetchWithAuth<BizmoneyHistory[]>(
        "/billing/bizmoney/histories",
        "GET",
        undefined,
        Object.keys(params).length > 0 ? params : undefined
      );
      return successResult(response.data);
    }

    case "get_bizmoney_cost": {
      const typedArgs = args as unknown as GetBizmoneyCostArgs;
      const params: Record<string, string> = {};
      if (typedArgs.searchStartDt) params.searchStartDt = typedArgs.searchStartDt;
      if (typedArgs.searchEndDt) params.searchEndDt = typedArgs.searchEndDt;

      const response = await fetchWithAuth<BizmoneyCost[]>(
        "/billing/bizmoney/cost",
        "GET",
        undefined,
        Object.keys(params).length > 0 ? params : undefined
      );
      return successResult(response.data);
    }

    default:
      return null;
  }
}
