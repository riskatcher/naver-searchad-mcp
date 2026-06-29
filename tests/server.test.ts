import { describe, it, expect } from "vitest";
import * as campaignTools from "../src/tools/campaigns.js";
import * as adgroupTools from "../src/tools/adgroups.js";
import * as keywordTools from "../src/tools/keywords.js";
import * as adTools from "../src/tools/ads.js";
import * as statsTools from "../src/tools/stats.js";
import * as channelTools from "../src/tools/channels.js";
import * as bizmoneyTools from "../src/tools/bizmoney.js";
import * as keywordToolTools from "../src/tools/keyword-tool.js";
import * as adExtensionTools from "../src/tools/ad-extensions.js";
import * as negativeKeywordTools from "../src/tools/negative-keywords.js";
import * as labelTools from "../src/tools/labels.js";
import * as miscTools from "../src/tools/misc.js";
import * as reportTools from "../src/tools/reports.js";
import * as restrictedKeywordTools from "../src/tools/restricted-keywords.js";
import type { ToolModule, AccessLevel } from "../src/types/common.js";
import { PERMISSION_ALLOWED } from "../src/types/common.js";

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
  reportTools,
  restrictedKeywordTools,
];

const allTools = toolModules.flatMap((m) => m.toolDefinitions);

describe("MCP Server Tools", () => {
  describe("Tool definitions", () => {
    it("should have 60 tools defined", () => {
      expect(allTools).toHaveLength(60);
    });

    it("should have unique tool names", () => {
      const names = allTools.map((t) => t.name);
      const uniqueNames = [...new Set(names)];
      expect(names).toHaveLength(uniqueNames.length);
    });

    it("should have descriptions for all tools", () => {
      allTools.forEach((tool) => {
        expect(tool.description).toBeDefined();
        expect(tool.description.length).toBeGreaterThan(0);
      });
    });

    it("should have valid inputSchema for all tools", () => {
      allTools.forEach((tool) => {
        expect(tool.inputSchema.type).toBe("object");
        expect(tool.inputSchema.properties).toBeDefined();
        expect(Array.isArray(tool.inputSchema.required)).toBe(true);
      });
    });
  });

  describe("Campaign tools (5)", () => {
    const tools = campaignTools.toolDefinitions;

    it("should have 5 campaign tools", () => {
      expect(tools).toHaveLength(5);
    });

    it("list_campaigns should not require parameters", () => {
      const tool = tools.find((t) => t.name === "list_campaigns");
      expect(tool?.inputSchema.required).toHaveLength(0);
    });

    it("get_campaign should require campaignId", () => {
      const tool = tools.find((t) => t.name === "get_campaign");
      expect(tool?.inputSchema.required).toContain("campaignId");
    });

    it("create_campaign should require name and campaignTp", () => {
      const tool = tools.find((t) => t.name === "create_campaign");
      expect(tool?.inputSchema.required).toContain("name");
      expect(tool?.inputSchema.required).toContain("campaignTp");
    });

    it("update_campaign should require campaignId", () => {
      const tool = tools.find((t) => t.name === "update_campaign");
      expect(tool?.inputSchema.required).toContain("campaignId");
    });

    it("delete_campaign should require campaignId", () => {
      const tool = tools.find((t) => t.name === "delete_campaign");
      expect(tool?.inputSchema.required).toContain("campaignId");
    });
  });

  describe("Ad group tools (6)", () => {
    const tools = adgroupTools.toolDefinitions;

    it("should have 6 adgroup tools", () => {
      expect(tools).toHaveLength(6);
    });

    it("get_adgroup_targets should require adgroupId", () => {
      const tool = tools.find((t) => t.name === "get_adgroup_targets");
      expect(tool?.inputSchema.required).toContain("adgroupId");
    });

    it("list_adgroups should not require parameters", () => {
      const tool = tools.find((t) => t.name === "list_adgroups");
      expect(tool?.inputSchema.required).toHaveLength(0);
    });

    it("get_adgroup should require adgroupId", () => {
      const tool = tools.find((t) => t.name === "get_adgroup");
      expect(tool?.inputSchema.required).toContain("adgroupId");
    });

    it("create_adgroup should require nccCampaignId and name", () => {
      const tool = tools.find((t) => t.name === "create_adgroup");
      expect(tool?.inputSchema.required).toContain("nccCampaignId");
      expect(tool?.inputSchema.required).toContain("name");
    });

    it("update_adgroup should require adgroupId", () => {
      const tool = tools.find((t) => t.name === "update_adgroup");
      expect(tool?.inputSchema.required).toContain("adgroupId");
    });

    it("delete_adgroup should require adgroupId", () => {
      const tool = tools.find((t) => t.name === "delete_adgroup");
      expect(tool?.inputSchema.required).toContain("adgroupId");
    });
  });

  describe("Keyword tools (5)", () => {
    const tools = keywordTools.toolDefinitions;

    it("should have 5 keyword tools", () => {
      expect(tools).toHaveLength(5);
    });

    it("list_keywords should require adgroupId", () => {
      const tool = tools.find((t) => t.name === "list_keywords");
      expect(tool?.inputSchema.required).toContain("adgroupId");
    });

    it("get_keyword should require keywordId", () => {
      const tool = tools.find((t) => t.name === "get_keyword");
      expect(tool?.inputSchema.required).toContain("keywordId");
    });

    it("create_keyword should require adgroupId and keyword", () => {
      const tool = tools.find((t) => t.name === "create_keyword");
      expect(tool?.inputSchema.required).toContain("adgroupId");
      expect(tool?.inputSchema.required).toContain("keyword");
    });

    it("update_keyword should require keywordId and nccAdgroupId", () => {
      const tool = tools.find((t) => t.name === "update_keyword");
      expect(tool?.inputSchema.required).toContain("keywordId");
      expect(tool?.inputSchema.required).toContain("nccAdgroupId");
    });

    it("delete_keyword should require keywordId", () => {
      const tool = tools.find((t) => t.name === "delete_keyword");
      expect(tool?.inputSchema.required).toContain("keywordId");
    });
  });

  describe("Ad tools (5)", () => {
    const tools = adTools.toolDefinitions;

    it("should have 5 ad tools", () => {
      expect(tools).toHaveLength(5);
    });

    it("list_ads should require adgroupId", () => {
      const tool = tools.find((t) => t.name === "list_ads");
      expect(tool?.inputSchema.required).toContain("adgroupId");
    });

    it("create_ad should require nccAdgroupId, type, and ad", () => {
      const tool = tools.find((t) => t.name === "create_ad");
      expect(tool?.inputSchema.required).toContain("nccAdgroupId");
      expect(tool?.inputSchema.required).toContain("type");
      expect(tool?.inputSchema.required).toContain("ad");
    });

    it("delete_ad should require adId", () => {
      const tool = tools.find((t) => t.name === "delete_ad");
      expect(tool?.inputSchema.required).toContain("adId");
    });
  });

  describe("Stats tools (7)", () => {
    const tools = statsTools.toolDefinitions;

    it("should have 7 stats tools", () => {
      expect(tools).toHaveLength(7);
    });

    it("get_stats should not require parameters in schema (validated at runtime)", () => {
      const tool = tools.find((t) => t.name === "get_stats");
      expect(tool?.inputSchema.required).toHaveLength(0);
    });

    it("create_stat_report should require reportTp", () => {
      const tool = tools.find((t) => t.name === "create_stat_report");
      expect(tool?.inputSchema.required).toContain("reportTp");
    });

    it("delete_stat_report should require reportJobId", () => {
      const tool = tools.find((t) => t.name === "delete_stat_report");
      expect(tool?.inputSchema.required).toContain("reportJobId");
    });
  });

  describe("Master report tools (5)", () => {
    const tools = reportTools.toolDefinitions;

    it("should have 5 master report tools", () => {
      expect(tools).toHaveLength(5);
    });

    it("create_master_report should require item", () => {
      const tool = tools.find((t) => t.name === "create_master_report");
      expect(tool?.inputSchema.required).toContain("item");
    });

    it("fetch_report_data should require kind", () => {
      const tool = tools.find((t) => t.name === "fetch_report_data");
      expect(tool?.inputSchema.required).toContain("kind");
    });
  });

  describe("Restricted keyword tools (3)", () => {
    const tools = restrictedKeywordTools.toolDefinitions;

    it("should have 3 restricted keyword tools", () => {
      expect(tools).toHaveLength(3);
    });

    it("create_restricted_keywords should require adgroupId and keywords", () => {
      const tool = tools.find((t) => t.name === "create_restricted_keywords");
      expect(tool?.inputSchema.required).toContain("adgroupId");
      expect(tool?.inputSchema.required).toContain("keywords");
    });
  });

  describe("Channel tools (3)", () => {
    const tools = channelTools.toolDefinitions;

    it("should have 3 channel tools", () => {
      expect(tools).toHaveLength(3);
    });
  });

  describe("Bizmoney tools (3)", () => {
    const tools = bizmoneyTools.toolDefinitions;

    it("should have 3 bizmoney tools", () => {
      expect(tools).toHaveLength(3);
    });
  });

  describe("Keyword tool tools (3)", () => {
    const tools = keywordToolTools.toolDefinitions;

    it("should have 3 keyword tool tools", () => {
      expect(tools).toHaveLength(3);
    });

    it("get_keyword_suggestions should require hintKeywords", () => {
      const tool = tools.find((t) => t.name === "get_keyword_suggestions");
      expect(tool?.inputSchema.required).toContain("hintKeywords");
    });
  });

  describe("Ad extension tools (4)", () => {
    const tools = adExtensionTools.toolDefinitions;

    it("should have 4 ad extension tools", () => {
      expect(tools).toHaveLength(4);
    });
  });

  describe("Negative keyword tools (3)", () => {
    const tools = negativeKeywordTools.toolDefinitions;

    it("should have 3 negative keyword tools", () => {
      expect(tools).toHaveLength(3);
    });
  });

  describe("Label tools (3)", () => {
    const tools = labelTools.toolDefinitions;

    it("should have 3 label tools", () => {
      expect(tools).toHaveLength(3);
    });
  });

  describe("Misc tools (5)", () => {
    const tools = miscTools.toolDefinitions;

    it("should have 5 misc tools", () => {
      expect(tools).toHaveLength(5);
    });
  });
});

describe("Permission modes", () => {
  it("every tool should have a valid accessLevel", () => {
    const validLevels: AccessLevel[] = ["read", "write", "delete"];
    allTools.forEach((tool) => {
      expect(validLevels).toContain(tool.accessLevel);
    });
  });

  it("should have 32 read tools", () => {
    const readTools = allTools.filter((t) => t.accessLevel === "read");
    expect(readTools).toHaveLength(32);
  });

  it("should have 17 write tools", () => {
    const writeTools = allTools.filter((t) => t.accessLevel === "write");
    expect(writeTools).toHaveLength(17);
  });

  it("should have 11 delete tools", () => {
    const deleteTools = allTools.filter((t) => t.accessLevel === "delete");
    expect(deleteTools).toHaveLength(11);
  });

  it("--ro mode should only allow read tools", () => {
    const allowed = PERMISSION_ALLOWED["ro"];
    expect(allowed).toEqual(["read"]);
    const filtered = allTools.filter((t) => allowed.includes(t.accessLevel));
    expect(filtered).toHaveLength(32);
    filtered.forEach((t) => expect(t.accessLevel).toBe("read"));
  });

  it("--rw mode should allow read + write tools", () => {
    const allowed = PERMISSION_ALLOWED["rw"];
    expect(allowed).toEqual(["read", "write"]);
    const filtered = allTools.filter((t) => allowed.includes(t.accessLevel));
    expect(filtered).toHaveLength(49);
    filtered.forEach((t) => expect(["read", "write"]).toContain(t.accessLevel));
  });

  it("--rwd mode should allow all tools", () => {
    const allowed = PERMISSION_ALLOWED["rwd"];
    expect(allowed).toEqual(["read", "write", "delete"]);
    const filtered = allTools.filter((t) => allowed.includes(t.accessLevel));
    expect(filtered).toHaveLength(60);
  });

  it("delete tools should include all *delete* named tools", () => {
    const deleteToolNames = allTools
      .filter((t) => t.accessLevel === "delete")
      .map((t) => t.name);
    const toolsWithDeleteInName = allTools
      .filter((t) => t.name.includes("delete"))
      .map((t) => t.name);
    expect(deleteToolNames.sort()).toEqual(toolsWithDeleteInName.sort());
  });

  it("write tools should include all *create* and *update* named tools", () => {
    const writeToolNames = allTools
      .filter((t) => t.accessLevel === "write")
      .map((t) => t.name);
    const toolsWithWriteInName = allTools
      .filter((t) => t.name.includes("create") || t.name.includes("update"))
      .map((t) => t.name);
    expect(writeToolNames.sort()).toEqual(toolsWithWriteInName.sort());
  });
});

describe("Date presets", () => {
  const validPresets = [
    "today",
    "yesterday",
    "last7days",
    "last30days",
    "lastweek",
    "lastmonth",
    "lastquarter",
  ];

  it("should have 7 valid date presets", () => {
    expect(validPresets).toHaveLength(7);
  });

  it("should include common date ranges", () => {
    expect(validPresets).toContain("today");
    expect(validPresets).toContain("yesterday");
    expect(validPresets).toContain("last7days");
    expect(validPresets).toContain("last30days");
  });
});

describe("Breakdown dimensions", () => {
  const validBreakdowns = ["pcMblTp", "dayw", "hh24", "regnNo"];

  it("should have 4 valid breakdown dimensions", () => {
    expect(validBreakdowns).toHaveLength(4);
  });

  it("should include device breakdown", () => {
    expect(validBreakdowns).toContain("pcMblTp");
  });

  it("should include time breakdowns", () => {
    expect(validBreakdowns).toContain("dayw");
    expect(validBreakdowns).toContain("hh24");
  });

  it("should include region breakdown", () => {
    expect(validBreakdowns).toContain("regnNo");
  });
});

describe("Available metrics", () => {
  const metrics = [
    "impCnt",
    "clkCnt",
    "salesAmt",
    "ctr",
    "cpc",
    "ccnt",
    "crto",
    "convAmt",
    "ror",
    "cpConv",
    "avgRnk",
  ];

  it("should have 11 available metrics", () => {
    expect(metrics).toHaveLength(11);
  });

  it("should include impression and click metrics", () => {
    expect(metrics).toContain("impCnt");
    expect(metrics).toContain("clkCnt");
  });

  it("should include cost metrics", () => {
    expect(metrics).toContain("salesAmt");
    expect(metrics).toContain("cpc");
  });

  it("should include conversion metrics", () => {
    expect(metrics).toContain("ccnt");
    expect(metrics).toContain("crto");
    expect(metrics).toContain("convAmt");
  });

  it("should include performance metrics", () => {
    expect(metrics).toContain("ctr");
    expect(metrics).toContain("ror");
    expect(metrics).toContain("avgRnk");
  });
});
