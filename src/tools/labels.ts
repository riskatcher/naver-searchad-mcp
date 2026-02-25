import { fetchWithAuth } from "../utils/fetchWithAuth.js";
import type {
  ToolDefinition,
  ToolResult,
  Label,
  CreateLabelArgs,
  DeleteLabelArgs,
} from "../types/index.js";
import { successResult, errorResult } from "../types/common.js";

export const toolDefinitions: ToolDefinition[] = [
  {
    name: "list_labels",
    description: "List all labels used for organizing campaigns, ad groups, etc.",
    accessLevel: "read",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "create_label",
    description: "Create a new label for organizing ad objects",
    accessLevel: "write",
    inputSchema: {
      type: "object" as const,
      properties: {
        name: {
          type: "string",
          description: "Label name",
        },
        color: {
          type: "string",
          description: "Label color (hex code, e.g., #FF0000)",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "delete_label",
    description: "Delete a label",
    accessLevel: "delete",
    inputSchema: {
      type: "object" as const,
      properties: {
        labelId: {
          type: "string",
          description: "Label ID to delete",
        },
      },
      required: ["labelId"],
    },
  },
];

export async function handleTool(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult | null> {
  switch (name) {
    case "list_labels": {
      const response = await fetchWithAuth<Label[]>("/ncc/labels");
      return successResult(response.data);
    }

    case "create_label": {
      const typedArgs = args as unknown as CreateLabelArgs;
      if (!typedArgs.name) return errorResult("name is required");

      const body: Record<string, unknown> = {
        name: typedArgs.name,
      };
      if (typedArgs.color !== undefined) body.color = typedArgs.color;

      const response = await fetchWithAuth<Label>("/ncc/labels", "POST", body);
      return successResult(response.data);
    }

    case "delete_label": {
      const { labelId } = args as unknown as DeleteLabelArgs;
      if (!labelId) return errorResult("labelId is required");
      const response = await fetchWithAuth<Label>(
        `/ncc/labels/${encodeURIComponent(labelId)}`,
        "DELETE"
      );
      return successResult(response.data);
    }

    default:
      return null;
  }
}
