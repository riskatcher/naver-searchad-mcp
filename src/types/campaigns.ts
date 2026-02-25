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

export interface CreateCampaignArgs {
  name: string;
  campaignTp: string;
  customerId?: string;
  dailyBudget?: number;
  deliveryMethod?: string;
}

export interface GetCampaignArgs {
  campaignId: string;
}

export interface UpdateCampaignArgs {
  campaignId: string;
  name?: string;
  dailyBudget?: number;
  useDailyBudget?: boolean;
  deliveryMethod?: string;
  trackingMode?: string;
  userLock?: boolean;
}

export interface DeleteCampaignArgs {
  campaignId: string;
}
