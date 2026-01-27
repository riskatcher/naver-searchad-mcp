import { describe, it, expect } from "vitest";
import type {
  Campaign,
  AdGroup,
  Keyword,
  Stats,
  CreateCampaignArgs,
  CreateAdgroupArgs,
  CreateKeywordArgs,
  GetStatsArgs,
  GetCampaignStatsArgs,
} from "../src/types.js";

describe("Types", () => {
  describe("Campaign", () => {
    it("should have correct shape", () => {
      const campaign: Campaign = {
        nccCampaignId: "cmp-123",
        customerId: 12345,
        name: "Test Campaign",
        campaignTp: "WEB_SITE",
        deliveryMethod: "STANDARD",
        trackingMode: "TRACKING",
        dailyBudget: 100000,
        useDailyBudget: true,
        status: "ELIGIBLE",
        statusReason: "",
        regTm: "2024-01-01T00:00:00Z",
        editTm: "2024-01-01T00:00:00Z",
      };

      expect(campaign.nccCampaignId).toBe("cmp-123");
      expect(campaign.status).toBe("ELIGIBLE");
    });

    it("should accept all valid status values", () => {
      const statuses: Campaign["status"][] = [
        "ELIGIBLE",
        "PAUSED",
        "SUSPENDED",
        "DELETED",
      ];

      statuses.forEach((status) => {
        const campaign: Partial<Campaign> = { status };
        expect(campaign.status).toBe(status);
      });
    });
  });

  describe("AdGroup", () => {
    it("should have correct shape", () => {
      const adGroup: AdGroup = {
        nccAdgroupId: "grp-123",
        nccCampaignId: "cmp-123",
        customerId: 12345,
        name: "Test Ad Group",
        bidAmt: 500,
        status: "ELIGIBLE",
        regTm: "2024-01-01T00:00:00Z",
        editTm: "2024-01-01T00:00:00Z",
      };

      expect(adGroup.nccAdgroupId).toBe("grp-123");
      expect(adGroup.nccCampaignId).toBe("cmp-123");
    });

    it("should allow optional channel IDs", () => {
      const adGroup: AdGroup = {
        nccAdgroupId: "grp-123",
        nccCampaignId: "cmp-123",
        customerId: 12345,
        name: "Test Ad Group",
        pcChannelId: "pc-channel",
        mobileChannelId: "mobile-channel",
        bidAmt: 500,
        status: "ELIGIBLE",
        regTm: "2024-01-01T00:00:00Z",
        editTm: "2024-01-01T00:00:00Z",
      };

      expect(adGroup.pcChannelId).toBe("pc-channel");
      expect(adGroup.mobileChannelId).toBe("mobile-channel");
    });
  });

  describe("Keyword", () => {
    it("should have correct shape", () => {
      const keyword: Keyword = {
        nccKeywordId: "kwd-123",
        nccAdgroupId: "grp-123",
        customerId: 12345,
        keyword: "test keyword",
        bidAmt: 300,
        status: "ELIGIBLE",
        regTm: "2024-01-01T00:00:00Z",
        editTm: "2024-01-01T00:00:00Z",
      };

      expect(keyword.nccKeywordId).toBe("kwd-123");
      expect(keyword.keyword).toBe("test keyword");
    });
  });

  describe("Stats", () => {
    it("should have correct shape with all optional metrics", () => {
      const stats: Stats = {
        id: "cmp-123",
        impCnt: 1000,
        clkCnt: 50,
        salesAmt: 25000,
        ctr: 5.0,
        cpc: 500,
        ccnt: 10,
        crto: 20.0,
        convAmt: 500000,
        ror: 2000.0,
        cpConv: 2500,
        avgRnk: 1.5,
      };

      expect(stats.id).toBe("cmp-123");
      expect(stats.impCnt).toBe(1000);
      expect(stats.ctr).toBe(5.0);
    });

    it("should allow partial stats", () => {
      const stats: Stats = {
        id: "cmp-123",
        impCnt: 1000,
        clkCnt: 50,
      };

      expect(stats.id).toBe("cmp-123");
      expect(stats.salesAmt).toBeUndefined();
    });
  });

  describe("Tool Arguments", () => {
    it("CreateCampaignArgs should have required fields", () => {
      const args: CreateCampaignArgs = {
        name: "Test Campaign",
        campaignTp: "WEB_SITE",
      };

      expect(args.name).toBe("Test Campaign");
      expect(args.campaignTp).toBe("WEB_SITE");
    });

    it("CreateCampaignArgs should allow optional fields", () => {
      const args: CreateCampaignArgs = {
        name: "Test Campaign",
        campaignTp: "WEB_SITE",
        customerId: "12345",
        dailyBudget: 100000,
        deliveryMethod: "STANDARD",
      };

      expect(args.dailyBudget).toBe(100000);
      expect(args.deliveryMethod).toBe("STANDARD");
    });

    it("CreateAdgroupArgs should have required fields", () => {
      const args: CreateAdgroupArgs = {
        nccCampaignId: "cmp-123",
        name: "Test Ad Group",
      };

      expect(args.nccCampaignId).toBe("cmp-123");
      expect(args.name).toBe("Test Ad Group");
    });

    it("CreateKeywordArgs should have required fields", () => {
      const args: CreateKeywordArgs = {
        adgroupId: "grp-123",
        keyword: "test keyword",
      };

      expect(args.adgroupId).toBe("grp-123");
      expect(args.keyword).toBe("test keyword");
    });

    it("GetStatsArgs should allow all optional fields", () => {
      const args: GetStatsArgs = {
        id: "cmp-123",
        ids: ["cmp-123", "cmp-456"],
        fields: ["impCnt", "clkCnt"],
        datePreset: "last30days",
        timeRange: { since: "2024-01-01", until: "2024-01-31" },
        timeIncrement: "1",
        breakdown: "pcMblTp",
      };

      expect(args.datePreset).toBe("last30days");
      expect(args.breakdown).toBe("pcMblTp");
    });

    it("GetCampaignStatsArgs should allow all optional fields", () => {
      const args: GetCampaignStatsArgs = {
        startDate: "2024-01-01",
        endDate: "2024-01-31",
        datePreset: "last30days",
      };

      expect(args.startDate).toBe("2024-01-01");
      expect(args.datePreset).toBe("last30days");
    });
  });
});
