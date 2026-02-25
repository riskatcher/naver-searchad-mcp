export interface MemberInfo {
  customerId: number;
  loginId: string;
  username: string;
  registerDate: string;
}

export interface QualityIndex {
  nccKeywordId: string;
  nccAdgroupId: string;
  keyword: string;
  qualityIndex: number;
  issueFactor: string[];
}

export interface GetQualityIndexArgs {
  adgroupId: string;
}

export interface IpExclusion {
  id: string;
  customerId: number;
  ip: string;
  description?: string;
  regTm: string;
  editTm: string;
}

export interface CreateIpExclusionArgs {
  ip: string;
  description?: string;
}

export interface DeleteIpExclusionArgs {
  id: string;
}
