import { IUser } from '../../entities/user';

export interface IAuthStatusResponseDto {
  loggedIn: boolean;
  user?: IUser | null;
  expiresAt?: Date | null;
  isRegistered?: boolean;
  canRegister?: boolean;
}
