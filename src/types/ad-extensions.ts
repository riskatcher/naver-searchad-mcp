export interface AdExtension {
  nccAdExtensionId: string;
  nccAdgroupId?: string;
  customerId: number;
  type: string;
  values?: Record<string, unknown>;
  status: string;
  regTm: string;
  editTm: string;
}

export interface ListAdExtensionsArgs {
  adgroupId: string;
}

export interface CreateAdExtensionArgs {
  nccAdgroupId: string;
  type: string;
  values: Record<string, unknown>;
}

export interface DeleteAdExtensionArgs {
  adExtensionId: string;
}
