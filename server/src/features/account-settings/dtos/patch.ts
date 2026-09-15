import { IUpdateAccountSettingsRequest } from '@shared/contracts/account/account-settings';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { TrimString } from '../../../utils/trim-string.transform';

export class UpdateAccountSettingsRequest implements IUpdateAccountSettingsRequest {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(350_000)
  photo: string | null;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(64)
  @TrimString()
  displayName: string;
}
