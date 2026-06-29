import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole, userRoleToInt } from '@shared/enums/user-role';
import { Repository } from 'typeorm';
import { User } from '../../typeorm/entities';

@Injectable()
export class ReckoningAccessService {
  constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) {}

  async verifyUserAccess(userId: number, reckoningId: number): Promise<boolean> {
    return this.userRepo.exists({
      where: {
        id: userId,
        reckoningUsers: { reckoningId },
      },
    });
  }

  async getUserRole(reckoningId: number, userId: number | undefined): Promise<{ role: UserRole }> {
    const user = await this.userRepo.findOne({
      where: {
        id: userId,
      },
      relations: ['reckoningUsers'],
    });
    if (!user) {
      throw new NotFoundException();
    }
    return { role: user.reckoningUsers.find(ru => ru.reckoningId === reckoningId)?.role! };
  }

  async isUserAuthorized(
    reckoningId: number,
    userId: number | undefined,
    minimumRole: UserRole,
    actualRole?: UserRole,
  ): Promise<boolean> {
    actualRole ??= (await this.getUserRole(reckoningId, userId)).role;
    const userRoleInt = userRoleToInt(actualRole);
    const minimumRoleInt = userRoleToInt(minimumRole);
    return userRoleInt >= minimumRoleInt;
  }
}
