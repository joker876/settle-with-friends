import { IUser } from '../../entities/user';

export interface IAuthStatusResponseDto {
  loggedIn: boolean;
  user?: IUser;
  expiresAt?: Date;
}
