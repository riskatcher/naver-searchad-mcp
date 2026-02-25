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

export interface ListKeywordsArgs {
  adgroupId: string;
}

export interface GetKeywordArgs {
  keywordId: string;
}

export interface CreateKeywordArgs {
  adgroupId: string;
  keyword: string;
  bidAmt?: number;
}

export interface UpdateKeywordArgs {
  keywordId: string;
  nccAdgroupId: string;
  bidAmt?: number;
  userLock?: boolean;
  inspectStatus?: string;
}

export interface DeleteKeywordArgs {
  keywordId: string;
}
