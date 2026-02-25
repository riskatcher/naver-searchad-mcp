export interface Label {
  nccLabelId: string;
  customerId: number;
  name: string;
  color: string;
  regTm: string;
  editTm: string;
}

export interface CreateLabelArgs {
  name: string;
  color?: string;
}

export interface DeleteLabelArgs {
  labelId: string;
}
