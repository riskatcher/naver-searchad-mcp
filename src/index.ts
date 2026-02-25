#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { version: string };

// Import all tool modules
import * as campaignTools from "./tools/campaigns.js";
import * as adgroupTools from "./tools/adgroups.js";
import * as keywordTools from "./tools/keywords.js";
import * as adTools from "./tools/ads.js";
import * as statsTools from "./tools/stats.js";
import * as channelTools from "./tools/channels.js";
import * as bizmoneyTools from "./tools/bizmoney.js";
import * as keywordToolTools from "./tools/keyword-tool.js";
import * as adExtensionTools from "./tools/ad-extensions.js";
import * as negativeKeywordTools from "./tools/negative-keywords.js";
import * as labelTools from "./tools/labels.js";
import * as miscTools from "./tools/misc.js";

import type { ToolModule, PermissionMode } from "./types/common.js";
import { PERMISSION_ALLOWED } from "./types/common.js";

// Parse permission mode from CLI args (default: ro for safety)
function parsePermissionMode(): PermissionMode {
  const args = process.argv.slice(2);
  if (args.includes("--rwd")) return "rwd";
  if (args.includes("--rw")) return "rw";
  if (args.includes("--ro")) return "ro";
  return "ro";
}

const permissionMode = parsePermissionMode();
const allowedLevels = PERMISSION_ALLOWED[permissionMode];

// Aggregate all tool modules
const toolModules: ToolModule[] = [
  campaignTools,
  adgroupTools,
  keywordTools,
  adTools,
  statsTools,
  channelTools,
  bizmoneyTools,
  keywordToolTools,
  adExtensionTools,
  negativeKeywordTools,
  labelTools,
  miscTools,
];

// Collect all tool definitions, filtered by permission mode
const allToolDefinitions = toolModules
  .flatMap((m) => m.toolDefinitions)
  .filter((t) => allowedLevels.includes(t.accessLevel));

// Build a set of allowed tool names for fast runtime lookup
const allowedToolNames = new Set(allToolDefinitions.map((t) => t.name));

// Build a map of tool name -> accessLevel for error messages
const toolAccessLevels = new Map(
  toolModules
    .flatMap((m) => m.toolDefinitions)
    .map((t) => [t.name, t.accessLevel])
);

const MODE_LABELS: Record<PermissionMode, string> = {
  ro: "READ-ONLY (--ro)",
  rw: "READ-WRITE (--rw)",
  rwd: "READ-WRITE-DELETE (--rwd)",
};

// Create the MCP server
const server = new Server(
  {
    name: "@packative/naver-searchad-mcp",
    version: pkg.version,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle list tools request - only return tools allowed by permission mode
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: allToolDefinitions };
});

// Handle tool calls - delegate to the appropriate module with permission check
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  // Permission gate: block tools not allowed in current mode
  if (!allowedToolNames.has(name)) {
    const level = toolAccessLevels.get(name);
    if (level) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error: Tool "${name}" requires "${level}" permission, but the server is running in ${MODE_LABELS[permissionMode]} mode. Restart with a higher permission flag to use this tool.`,
          },
        ],
        isError: true,
      };
    }
    return {
      content: [
        {
          type: "text" as const,
          text: `Error: Unknown tool: ${name}`,
        },
      ],
      isError: true,
    };
  }

  try {
    // Try each module until one handles the tool
    for (const mod of toolModules) {
      const result = await mod.handleTool(
        name,
        args as Record<string, unknown>
      );
      if (result !== null) {
        return result;
      }
    }

    // No module handled this tool
    return {
      content: [
        {
          type: "text" as const,
          text: `Error: Unknown tool: ${name}`,
        },
      ],
      isError: true,
    };
  } catch (error) {
    const err = error as Error & {
      response?: { data?: { message?: string } };
    };
    const errorMessage = err.response?.data?.message || err.message;
    return {
      content: [
        {
          type: "text" as const,
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  const readCount = allToolDefinitions.filter((t) => t.accessLevel === "read").length;
  const writeCount = allToolDefinitions.filter((t) => t.accessLevel === "write").length;
  const deleteCount = allToolDefinitions.filter((t) => t.accessLevel === "delete").length;

  console.error(
    `Naver SearchAd MCP server v${pkg.version} running on stdio`
  );
  console.error(
    `Permission mode: ${MODE_LABELS[permissionMode]} | Tools available: ${allToolDefinitions.length} (${readCount} read, ${writeCount} write, ${deleteCount} delete)`
  );
}

main().catch((error: Error) => {
  console.error("Server error:", error);
  process.exit(1);
});
