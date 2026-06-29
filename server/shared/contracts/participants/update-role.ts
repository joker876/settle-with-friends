
import { UserRole } from '../../enums/user-role';

export interface IUpdateUserRoleRequest {
  role: UserRole;
}
export interface IUpdateUserRoleResponse {
  role: UserRole;
}