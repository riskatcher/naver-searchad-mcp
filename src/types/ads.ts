export interface Ad {
  nccAdId: string;
  nccAdgroupId: string;
  customerId: number;
  inspectStatus: string;
  type: string;
  ad: {
    pc?: AdDetail;
    mobile?: AdDetail;
    description?: string;
    headline?: string;
  };
  adAttr?: Record<string, unknown>;
  userLock: boolean;
  status: string;
  statusReason: string;
  regTm: string;
  editTm: string;
}

export interface AdDetail {
  final?: string;
  display?: string;
  mobile?: string;
  headline?: string;
  description?: string;
  description2?: string;
}

export interface ListAdsArgs {
  adgroupId: string;
}

export interface GetAdArgs {
  adId: string;
}

export interface CreateAdArgs {
  nccAdgroupId: string;
  type: string;
  ad: Record<string, unknown>;
  adAttr?: Record<string, unknown>;
  userLock?: boolean;
}

export interface UpdateAdArgs {
  adId: string;
  userLock?: boolean;
  inspectRequestMsg?: string;
  ad?: Record<string, unknown>;
  adAttr?: Record<string, unknown>;
}

export interface DeleteAdArgs {
  adId: string;
}
