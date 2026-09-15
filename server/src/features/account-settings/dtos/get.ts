import { IGetAccountSettingsResponse } from "@shared/contracts/account/account-settings";

export class GetAccountSettingsResponse implements IGetAccountSettingsResponse {
  photo: string | null;
  displayName: string;
  email: string;
  registeredAt: Date;
}