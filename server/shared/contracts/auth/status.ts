import { IUser } from '../../entities/user';

export interface AuthStatusResponseDto {
  loggedIn: boolean;
  user?: IUser;
  expiresAt?: Date;
}
