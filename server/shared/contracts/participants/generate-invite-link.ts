export interface IGenerateInviteLinkRequest {
  userLimit: number;
  expirationDate: Date;
}

export interface IGenerateInviteLinkResponse {
  token: string;
}
