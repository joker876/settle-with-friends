import { IAuthRegisterRequestDto } from '@shared/contracts/auth/register';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { TrimString } from '../../utils/trim-string.transform';

export class AuthRegisterRequestDto implements IAuthRegisterRequestDto {
  @IsString()
  @IsNotEmpty()
  @TrimString()
  displayName: string;

  @IsBoolean()
  acceptsPhoto: boolean;
}
