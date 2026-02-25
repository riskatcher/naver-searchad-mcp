import { fetchWithAuth } from "../utils/fetchWithAuth.js";
import type {
  ToolDefinition,
  ToolResult,
  MemberInfo,
  QualityIndex,
  IpExclusion,
  GetQualityIndexArgs,
  CreateIpExclusionArgs,
  DeleteIpExclusionArgs,
} from "../types/index.js";
import { successResult, errorResult } from "../types/common.js";

export const toolDefinitions: ToolDefinition[] = [
  {
    name: "get_member_info",
    description: "Get current member (account) information",
    accessLevel: "read",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "get_quality_index",
    accessLevel: "read",
    description:
      "Get quality index (quality score) for keywords in an ad group. Shows quality factors and improvement suggestions.",
    inputSchema: {
      type: "object" as const,
      properties: {
        adgroupId: {
          type: "string",
          description: "Ad group ID to get quality index for",
        },
      },
      required: ["adgroupId"],
    },
  },
  {
    name: "list_ip_exclusions",
    description: "List all IP exclusions (blocked IPs) for click fraud prevention",
    accessLevel: "read",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "create_ip_exclusion",
    description: "Add an IP address to the exclusion list to block fraudulent clicks",
    accessLevel: "write",
    inputSchema: {
      type: "object" as const,
      properties: {
        ip: {
          type: "string",
          description: "IP address to exclude (e.g., 192.168.1.1)",
        },
        description: {
          type: "string",
          description: "Optional description for this exclusion",
        },
      },
      required: ["ip"],
    },
  },
  {
    name: "delete_ip_exclusion",
    description: "Remove an IP address from the exclusion list",
    accessLevel: "delete",
    inputSchema: {
      type: "object" as const,
      properties: {
        id: {
          type: "string",
          description: "IP exclusion ID to delete",
        },
      },
      required: ["id"],
    },
  },
];

export async function handleTool(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult | null> {
  switch (name) {
    case "get_member_info": {
      const response = await fetchWithAuth<MemberInfo>("/ncc/members");
      return successResult(response.data);
    }

    case "get_quality_index": {
      const { adgroupId } = args as unknown as GetQualityIndexArgs;
      if (!adgroupId) return errorResult("adgroupId is required");
      const response = await fetchWithAuth<QualityIndex[]>(
        "/ncc/qi/keywords",
        "GET",
        undefined,
        { nccAdgroupId: adgroupId }
      );
      return successResult(response.data);
    }

    case "list_ip_exclusions": {
      const response = await fetchWithAuth<IpExclusion[]>("/ncc/ip-exclusions");
      return successResult(response.data);
    }

    case "create_ip_exclusion": {
      const typedArgs = args as unknown as CreateIpExclusionArgs;
      if (!typedArgs.ip) return errorResult("ip is required");

      const body: Record<string, unknown> = {
        ip: typedArgs.ip,
      };
      if (typedArgs.description !== undefined) body.description = typedArgs.description;

      const response = await fetchWithAuth<IpExclusion>(
        "/ncc/ip-exclusions",
        "POST",
        body
      );
      return successResult(response.data);
    }

    case "delete_ip_exclusion": {
      const { id } = args as unknown as DeleteIpExclusionArgs;
      if (!id) return errorResult("id is required");
      const response = await fetchWithAuth<IpExclusion>(
        `/ncc/ip-exclusions/${encodeURIComponent(id)}`,
        "DELETE"
      );
      return successResult(response.data);
    }

    default:
      return null;
  }
}
