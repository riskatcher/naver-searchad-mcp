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

export interface UpdateAdgroupArgs {
  adgroupId: string;
  name?: string;
  bidAmt?: number;
  pcChannelId?: string;
  mobileChannelId?: string;
  userLock?: boolean;
  useDailyBudget?: boolean;
  dailyBudget?: number;
  targetLocation?: object;
  targets?: object;
}

export interface DeleteAdgroupArgs {
  adgroupId: string;
}
