import { IUserWithRole } from '@shared/entities/user';
import { UserRole } from '@shared/enums/user-role';

export class UserWithRoleDto implements IUserWithRole {
  id: number;
  email: string;
  displayName: string;
  photo: string | null;
  role: UserRole;
}
