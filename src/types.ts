import type { AxiosResponse } from "axios";

// API Response types
export interface Campaign {
  nccCampaignId: string;
  customerId: number;
  name: string;
  campaignTp: string;
  deliveryMethod: string;
  trackingMode: string;
  dailyBudget: number;
  useDailyBudget: boolean;
  status: "ELIGIBLE" | "PAUSED" | "SUSPENDED" | "DELETED";
  statusReason: string;
  regTm: string;
  editTm: string;
}

export interface AdGroup {
  nccAdgroupId: string;
  nccCampaignId: string;
  customerId: number;
  name: string;
  pcChannelId?: string;
  mobileChannelId?: string;
  bidAmt: number;
  status: string;
  regTm: string;
  editTm: string;
}

export interface Keyword {
  nccKeywordId: string;
  nccAdgroupId: string;
  customerId: number;
  keyword: string;
  bidAmt: number;
  status: string;
  regTm: string;
  editTm: string;
}

export interface Stats {
  id: string;
  impCnt?: number;
  clkCnt?: number;
  salesAmt?: number;
  ctr?: number;
  cpc?: number;
  ccnt?: number;
  crto?: number;
  convAmt?: number;
  ror?: number;
  cpConv?: number;
  avgRnk?: number;
}

export interface CampaignWithStats extends Campaign {
  stats: Stats | null;
}

// Tool argument types
export interface CreateCampaignArgs {
  name: string;
  campaignTp: string;
  customerId?: string;
  dailyBudget?: number;
  deliveryMethod?: string;
}

export interface DeleteCampaignArgs {
  campaignId: string;
}

export interface ListAdgroupsArgs {
  campaignId?: string;
}

export interface GetAdgroupArgs {
  adgroupId: string;
}

export interface CreateAdgroupArgs {
  nccCampaignId: string;
  name: string;
  pcChannelId?: string;
  mobileChannelId?: string;
  bidAmt?: number;
}

export interface ListKeywordsArgs {
  adgroupId: string;
}

export interface CreateKeywordArgs {
  adgroupId: string;
  keyword: string;
  bidAmt?: number;
}

export interface TimeRange {
  since: string;
  until: string;
}

export interface GetStatsArgs {
  id?: string;
  ids?: string[];
  fields?: string[];
  datePreset?: string;
  timeRange?: TimeRange;
  timeIncrement?: string;
  breakdown?: string;
}

export interface GetCampaignStatsArgs {
  startDate?: string;
  endDate?: string;
  datePreset?: string;
}

// HTTP method type
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

// Fetch response type
export type ApiResponse<T = unknown> = AxiosResponse<T>;
