// Master Report (entity snapshot) types.
// The master-report API produces TSV dumps of account *entities* (campaigns,
// ad groups, keywords, ads, etc.) rather than performance statistics. It
// complements the stat-report API in stats.ts, which produces performance data.

export interface MasterReportJob {
  id: string;
  customerId: number;
  item: string;
  // Present only for delta reports (changes since fromTime).
  fromTime?: string;
  // ISO timestamp the report covers.
  toTime?: string;
  // BUILDING | BUILT | NONE | ERROR, etc.
  status?: string;
  // Signed URL to download the TSV result once status is BUILT.
  downloadUrl?: string;
  registTime?: string;
  updateTime?: string;
}

export interface CreateMasterReportArgs {
  item: string;
  // When provided, a *delta* report is requested (entities changed since this
  // time). When omitted, a *full* snapshot is requested.
  fromTime?: string;
}

export interface GetMasterReportArgs {
  reportJobId: string;
}

export interface DeleteMasterReportArgs {
  reportJobId: string;
}

export interface FetchReportDataArgs {
  kind: "stat" | "master";
  // Required when kind === "stat".
  reportTp?: string;
  statDt?: string;
  // Required when kind === "master".
  item?: string;
  fromTime?: string;
  // Optional names to map each positional TSV column onto an object.
  columns?: string[];
  // Maximum rows to return (default 1000).
  limit?: number;
  // Maximum seconds to wait for the job to build (default 60).
  maxWaitSeconds?: number;
  // Delete the report job after downloading to free the per-account slot
  // (default true).
  cleanup?: boolean;
}
