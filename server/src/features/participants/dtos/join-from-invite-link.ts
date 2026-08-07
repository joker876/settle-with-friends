import { IInviteLinkDataResponse } from '@shared/contracts/participants/join-from-invite-link';
import { IUserPublicData } from '@shared/entities/user';

export class JoinFromInviteLinkResponseDto implements IInviteLinkDataResponse {
  alreadyJoined: boolean;
  reckoning: {
    id: number;
    name: string;
    users: IUserPublicData[];
    createdAt: Date;
    updatedAt: Date;
  };
}
