import {
  IGenerateInviteLinkRequest,
  IGenerateInviteLinkResponse,
} from '@shared/contracts/participants/generate-invite-link';
import { Type } from 'class-transformer';
import { IsDate, IsInt, Min } from 'class-validator';

export class GenerateInviteLinkRequestDto implements IGenerateInviteLinkRequest {
  @IsInt()
  @Min(1)
  userLimit: number;

  @IsDate()
  @Type(() => Date)
  expirationDate: Date;
}

export class GenerateInviteLinkResponseDto implements IGenerateInviteLinkResponse {
  token: string;
}
