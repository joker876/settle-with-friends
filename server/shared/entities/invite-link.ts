import { IUser } from "./user";


export interface IInviteLinkBasicData {
  id: number;
  token: string;
  expiresAt: Date;
  uses: number;
  usesLeft: number;
  lastUsedAt: Date | null;
}

export interface IInviteLink extends IInviteLinkBasicData {
  createdByUserId: number;
  createdBy: IUser;
  createdDate: Date;
}