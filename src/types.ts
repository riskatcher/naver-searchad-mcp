// Re-export all types from the new modular structure for backward compatibility
export type {
  Campaign,
  CreateCampaignArgs,
  DeleteCampaignArgs,
} from "./types/campaigns.js";

export type {
  AdGroup,
  ListAdgroupsArgs,
  GetAdgroupArgs,
  CreateAdgroupArgs,
} from "./types/adgroups.js";

export type {
  Keyword,
  ListKeywordsArgs,
  CreateKeywordArgs,
} from "./types/keywords.js";

export type {
  Stats,
  CampaignWithStats,
  TimeRange,
  GetStatsArgs,
  GetCampaignStatsArgs,
} from "./types/stats.js";

export type {
  HttpMethod,
  ApiResponse,
} from "./types/common.js";
