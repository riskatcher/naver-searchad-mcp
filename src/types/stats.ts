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

export interface CampaignWithStats {
  nccCampaignId: string;
  customerId: number;
  name: string;
  campaignTp: string;
  deliveryMethod: string;
  trackingMode: string;
  dailyBudget: number;
  useDailyBudget: boolean;
  status: string;
  statusReason: string;
  regTm: string;
  editTm: string;
  stats: Stats | null;
}

export interface CreateStatReportArgs {
  reportTp: string;
  statDt: string;
}

export interface GetStatReportArgs {
  reportJobId: string;
}

export interface DownloadStatReportArgs {
  reportJobId: string;
}

export interface DeleteStatReportArgs {
  reportJobId: string;
}
