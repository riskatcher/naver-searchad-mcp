export interface Bizmoney {
  bizmoney: number;
  budgetLock: boolean;
  customerId: number;
  refundLock: boolean;
}

export interface BizmoneyHistory {
  customerId: number;
  title: string;
  bizmoney: number;
  eventTm: string;
  eventType: string;
  description?: string;
}

export interface BizmoneyCost {
  customerId: number;
  date: string;
  cost: number;
  device: string;
}

export interface GetBizmoneyHistoriesArgs {
  searchStartDt?: string;
  searchEndDt?: string;
}

export interface GetBizmoneyCostArgs {
  searchStartDt?: string;
  searchEndDt?: string;
}
