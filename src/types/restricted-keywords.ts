// Restricted keywords are ad-group-level keywords that restrict automatic
// "Keyword Plus" expansion. They are distinct from negative keywords
// (negative-keywords.ts), which suppress matching of explicit search terms.

export interface RestrictedKeyword {
  nccRestrictedKeywordId: string;
  nccAdgroupId: string;
  customerId: number;
  keyword: string;
  type: string;
  regTm: string;
  editTm: string;
}

export interface ListRestrictedKeywordsArgs {
  adgroupId: string;
  type?: string;
}

export interface CreateRestrictedKeywordsArgs {
  adgroupId: string;
  keywords: Array<{
    keyword: string;
    type?: string;
  }>;
}

export interface DeleteRestrictedKeywordsArgs {
  adgroupId: string;
  ids: string[];
}
