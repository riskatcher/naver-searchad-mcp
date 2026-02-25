import type { AxiosResponse } from "axios";

// HTTP method type
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// Fetch response type
export type ApiResponse<T = unknown> = AxiosResponse<T>;

// Permission levels for tool access control
export type AccessLevel = "read" | "write" | "delete";

// Permission modes: --ro (read only), --rw (read + write), --rwd (read + write + delete)
export type PermissionMode = "ro" | "rw" | "rwd";

// Which access levels each permission mode allows
export const PERMISSION_ALLOWED: Record<PermissionMode, AccessLevel[]> = {
  ro: ["read"],
  rw: ["read", "write"],
  rwd: ["read", "write", "delete"],
};

// MCP tool definition
export interface ToolDefinition {
  name: string;
  description: string;
  accessLevel: AccessLevel;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required: string[];
  };
}

// MCP tool result - uses index signature to be compatible with SDK's ServerResult type
export interface ToolResult {
  [key: string]: unknown;
  content: Array<{
    type: "text";
    text: string;
  }>;
  isError?: boolean;
}

// Tool module interface - each tool file exports this shape
export interface ToolModule {
  toolDefinitions: ToolDefinition[];
  handleTool: (name: string, args: Record<string, unknown>) => Promise<ToolResult | null>;
}

// Helper to create a success result
export function successResult(data: unknown): ToolResult {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

// Helper to create an error result
export function errorResult(message: string): ToolResult {
  return {
    content: [
      {
        type: "text" as const,
        text: `Error: ${message}`,
      },
    ],
    isError: true,
  };
}
