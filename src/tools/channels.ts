import { fetchWithAuth } from "../utils/fetchWithAuth.js";
import type {
  ToolDefinition,
  ToolResult,
  Channel,
  GetChannelArgs,
  CreateChannelArgs,
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
  {
    name: "create_channel",
    description:
      "Create a business channel (e.g. a website, phone number, or naver TalkTalk channel) that ad groups and ads link to.",
    accessLevel: "write",
    inputSchema: {
      type: "object" as const,
      properties: {
        channelTp: {
          type: "string",
          description:
            "Channel type, e.g. SITE (website), PHONE, NAVER_TALK, POWER_LINK, SHOPPING_MALL.",
        },
        name: {
          type: "string",
          description: "Display name for the channel",
        },
        channelKey: {
          type: "string",
          description:
            "Channel key/value (e.g. the site URL or phone number, depending on channelTp).",
        },
        url: {
          type: "string",
          description: "Landing URL for the channel, when applicable.",
        },
      },
      required: ["channelTp"],
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

    case "create_channel": {
      const typedArgs = args as unknown as CreateChannelArgs;
      if (!typedArgs.channelTp) return errorResult("channelTp is required");
      const body: Record<string, unknown> = { channelTp: typedArgs.channelTp };
      if (typedArgs.name !== undefined) body.name = typedArgs.name;
      if (typedArgs.channelKey !== undefined) body.channelKey = typedArgs.channelKey;
      if (typedArgs.url !== undefined) body.url = typedArgs.url;

      const response = await fetchWithAuth<Channel>(
        "/ncc/channels",
        "POST",
        body
      );
      return successResult(response.data);
    }

    default:
      return null;
  }
}
