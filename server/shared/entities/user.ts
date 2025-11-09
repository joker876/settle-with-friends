import { UserRole } from '../enums/user-role';

export interface IUser {
  id: number;
  email: string;
  displayName: string;
  photo?: string;
}

export interface IUserWithRole extends IUser {
  role: UserRole;
}
