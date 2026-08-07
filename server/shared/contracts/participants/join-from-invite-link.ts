import { IUserPublicData } from "../../entities/user";

export interface IInviteLinkDataResponse {
  alreadyJoined: boolean;
  reckoning: {
    id: number;
    name: string;
    users: IUserPublicData[];
    createdAt: Date;
    updatedAt: Date;
  };
}