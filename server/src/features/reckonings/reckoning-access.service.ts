import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole, userRoleToInt } from '@shared/enums/user-role';
import { In, IsNull, Repository } from 'typeorm';
import { User } from '../../typeorm/entities';

@Injectable()
export class ReckoningAccessService {
  constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) {}

  async verifyUserAccess(userId: number, reckoningId: number): Promise<boolean> {
    if (userId < 1) return false;
    return this.userRepo.exists({
      where: {
        id: userId,
        reckoningUsers: { reckoningId, deletedAt: IsNull() },
      },
    });
  }
  async verifyMultipleUsersAccess(
    userIds: number[],
    reckoningId: number,
    withDeleted: boolean = false,
  ): Promise<boolean> {
    const uniqueUserIds = [...new Set(userIds)];
    if (uniqueUserIds.some(id => id < 1)) return false;

    const count = await this.userRepo.count({
      where: {
        id: In(uniqueUserIds),
        reckoningUsers: { reckoningId },
      },
      withDeleted,
    });
    return count === uniqueUserIds.length;
  }

  async getUserRole(reckoningId: number, userId: number | undefined): Promise<{ role: UserRole | undefined }> {
    const user = await this.userRepo.findOne({
      where: {
        id: userId,
      },
      relations: ['reckoningUsers'],
    });
    if (!user) {
      throw new NotFoundException();
    }
    return { role: user.reckoningUsers.find(ru => ru.reckoningId === reckoningId)?.role };
  }

  async isUserAuthorized(
    reckoningId: number,
    userId: number | undefined,
    minimumRole: UserRole | null,
    actualRole?: UserRole,
    expectHigherOrEqual: boolean = true,
  ): Promise<boolean> {
    if (!minimumRole) return false;
    actualRole ??= (await this.getUserRole(reckoningId, userId)).role;
    const userRoleInt = userRoleToInt(actualRole);
    const minimumRoleInt = userRoleToInt(minimumRole);

    if (expectHigherOrEqual) {
      return userRoleInt >= minimumRoleInt;
    }
    return userRoleInt > minimumRoleInt;
  }
}
