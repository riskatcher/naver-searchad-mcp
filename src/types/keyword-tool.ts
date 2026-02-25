export interface KeywordSuggestion {
  relKeyword: string;
  monthlyPcQcCnt: number;
  monthlyMobileQcCnt: number;
  monthlyAvePcClkCnt: number;
  monthlyAveMobileClkCnt: number;
  monthlyAvePcCtr: number;
  monthlyAveMobileCtr: number;
  plAvgDepth: number;
  compIdx: string;
}

export interface EstimatePerformance {
  keyword: string;
  bid: number;
  impressions: number;
  clicks: number;
  cost: number;
  rank: number;
}

export interface EstimateMedianBid {
  keyword: string;
  bid: number;
}

export interface GetKeywordSuggestionsArgs {
  hintKeywords: string[];
  showDetail?: boolean;
}

export interface GetEstimatePerformanceArgs {
  device?: string;
  keywordplus?: boolean;
  key?: string;
  bids?: number[];
  keywords?: string[];
}

export interface GetEstimateMedianBidArgs {
  keywords: string[];
}
