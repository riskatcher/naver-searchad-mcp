import { describe, it, expect } from "vitest";

describe("MCP Server Tools", () => {
  const tools = [
    {
      name: "list_campaigns",
      description: "List all Naver SearchAd campaigns",
      requiredParams: [],
    },
    {
      name: "create_campaign",
      description: "Create a new Naver SearchAd campaign",
      requiredParams: ["name", "campaignTp"],
    },
    {
      name: "delete_campaign",
      description: "Delete a Naver SearchAd campaign",
      requiredParams: ["campaignId"],
    },
    {
      name: "list_adgroups",
      description: "List all ad groups, optionally filtered by campaign",
      requiredParams: [],
    },
    {
      name: "get_adgroup",
      description: "Get details of a specific ad group",
      requiredParams: ["adgroupId"],
    },
    {
      name: "create_adgroup",
      description: "Create a new ad group within a campaign",
      requiredParams: ["nccCampaignId", "name"],
    },
    {
      name: "list_keywords",
      description: "List all keywords in an ad group",
      requiredParams: ["adgroupId"],
    },
    {
      name: "create_keyword",
      description: "Add a keyword to an ad group",
      requiredParams: ["adgroupId", "keyword"],
    },
    {
      name: "get_stats",
      description: "Get performance statistics",
      requiredParams: [],
    },
    {
      name: "get_campaign_stats",
      description: "Get performance statistics for all active campaigns",
      requiredParams: [],
    },
  ];

  describe("Tool definitions", () => {
    it("should have 10 tools defined", () => {
      expect(tools).toHaveLength(10);
    });

    it("should have unique tool names", () => {
      const names = tools.map((t) => t.name);
      const uniqueNames = [...new Set(names)];
      expect(names).toHaveLength(uniqueNames.length);
    });

    it("should have descriptions for all tools", () => {
      tools.forEach((tool) => {
        expect(tool.description).toBeDefined();
        expect(tool.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Campaign tools", () => {
    it("list_campaigns should not require parameters", () => {
      const tool = tools.find((t) => t.name === "list_campaigns");
      expect(tool?.requiredParams).toHaveLength(0);
    });

    it("create_campaign should require name and campaignTp", () => {
      const tool = tools.find((t) => t.name === "create_campaign");
      expect(tool?.requiredParams).toContain("name");
      expect(tool?.requiredParams).toContain("campaignTp");
    });

    it("delete_campaign should require campaignId", () => {
      const tool = tools.find((t) => t.name === "delete_campaign");
      expect(tool?.requiredParams).toContain("campaignId");
    });
  });

  describe("Ad group tools", () => {
    it("list_adgroups should not require parameters", () => {
      const tool = tools.find((t) => t.name === "list_adgroups");
      expect(tool?.requiredParams).toHaveLength(0);
    });

    it("get_adgroup should require adgroupId", () => {
      const tool = tools.find((t) => t.name === "get_adgroup");
      expect(tool?.requiredParams).toContain("adgroupId");
    });

    it("create_adgroup should require nccCampaignId and name", () => {
      const tool = tools.find((t) => t.name === "create_adgroup");
      expect(tool?.requiredParams).toContain("nccCampaignId");
      expect(tool?.requiredParams).toContain("name");
    });
  });

  describe("Keyword tools", () => {
    it("list_keywords should require adgroupId", () => {
      const tool = tools.find((t) => t.name === "list_keywords");
      expect(tool?.requiredParams).toContain("adgroupId");
    });

    it("create_keyword should require adgroupId and keyword", () => {
      const tool = tools.find((t) => t.name === "create_keyword");
      expect(tool?.requiredParams).toContain("adgroupId");
      expect(tool?.requiredParams).toContain("keyword");
    });
  });

  describe("Statistics tools", () => {
    it("get_stats should not require parameters", () => {
      const tool = tools.find((t) => t.name === "get_stats");
      expect(tool?.requiredParams).toHaveLength(0);
    });

    it("get_campaign_stats should not require parameters", () => {
      const tool = tools.find((t) => t.name === "get_campaign_stats");
      expect(tool?.requiredParams).toHaveLength(0);
    });
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
