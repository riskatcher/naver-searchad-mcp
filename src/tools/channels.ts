import { fetchWithAuth } from "../utils/fetchWithAuth.js";
import type {
  ToolDefinition,
  ToolResult,
  Channel,
  GetChannelArgs,
} from "../types/index.js";
import { successResult, errorResult } from "../types/common.js";

export const toolDefinitions: ToolDefinition[] = [
  {
    name: "list_channels",
    description: "List all business channels (tracking URLs for PC/mobile landing pages)",
    accessLevel: "read",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "get_channel",
    description: "Get details of a specific business channel",
    accessLevel: "read",
    inputSchema: {
      type: "object" as const,
      properties: {
        channelId: {
          type: "string",
          description: "Channel ID",
        },
      },
      required: ["channelId"],
    },
  },
];

export async function handleTool(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult | null> {
  switch (name) {
    case "list_channels": {
      const response = await fetchWithAuth<Channel[]>("/ncc/channels");
      return successResult(response.data);
    }

    case "get_channel": {
      const { channelId } = args as unknown as GetChannelArgs;
      if (!channelId) return errorResult("channelId is required");
      const response = await fetchWithAuth<Channel>(
        `/ncc/channels/${encodeURIComponent(channelId)}`
      );
      return successResult(response.data);
    }

    default:
      return null;
  }
}
