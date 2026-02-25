export interface NegativeKeyword {
  nccNegativeKeywordId: string;
  nccAdgroupId?: string;
  nccCampaignId?: string;
  customerId: number;
  keyword: string;
  type: string;
  regTm: string;
  editTm: string;
}

export interface ListNegativeKeywordsArgs {
  adgroupId?: string;
  campaignId?: string;
}

export interface CreateNegativeKeywordsArgs {
  nccAdgroupId?: string;
  nccCampaignId?: string;
  keywords: Array<{
    keyword: string;
    type?: string;
  }>;
}

export interface DeleteNegativeKeywordsArgs {
  ids: string[];
}
