export interface IGetAccountSettingsResponse {
  photo: string | null;
  displayName: string;
  email: string;
  registeredAt: Date;
}

export interface IUpdateAccountSettingsRequest {
  photo: string | null;
  displayName: string;
}
