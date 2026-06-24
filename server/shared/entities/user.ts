import { UserRole } from '../enums/user-role';

export interface IUserPublicData {
  id: number;
  displayName: string;
  photo: string | null;
}

export interface IUser extends IUserPublicData {
  email: string;
}

export interface IUserWithRole extends IUser {
  role: UserRole;
}
