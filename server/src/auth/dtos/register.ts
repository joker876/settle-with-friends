import { IAuthRegisterRequestDto } from "@shared/contracts/auth/register";
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class AuthRegisterRequestDto implements IAuthRegisterRequestDto {
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsBoolean()
  acceptsPhoto: boolean;
}