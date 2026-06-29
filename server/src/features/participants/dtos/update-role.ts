import { IUpdateUserRoleRequest, IUpdateUserRoleResponse } from "@shared/contracts/participants/update-role";
import { UserRole } from "@shared/enums/user-role";
import { IsEnum } from "class-validator";


export class UpdateUserRoleRequestDto implements IUpdateUserRoleRequest {
  @IsEnum(UserRole)
  role: UserRole;
}

export class UpdateUserRoleResponseDto implements IUpdateUserRoleResponse {
  role: UserRole;
}