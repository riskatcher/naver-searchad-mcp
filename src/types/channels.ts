export interface Channel {
  nccChannelId: string;
  customerId: number;
  name: string;
  channelTp: string;
  channelKey: string;
  url?: string;
  trackingUrl?: string;
  regTm: string;
  editTm: string;
}

export interface GetChannelArgs {
  channelId: string;
}
