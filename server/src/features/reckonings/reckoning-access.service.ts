import { Injectable, UnauthorizedException } from '@nestjs/common';
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
    if (!userId) {
      throw new UnauthorizedException();
    }
    const user = await this.userRepo.findOne({
      where: {
        id: userId,
        reckoningUsers: { reckoningId },
      },
      relations: ['reckoningUsers'],
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    return { role: user.reckoningUsers.find(ru => ru.reckoningId === reckoningId)?.role! };
  }

  async isUserAuthorized(reckoningId: number, userId: number | undefined, minimumRole: UserRole): Promise<boolean> {
    const userRole = await this.getUserRole(reckoningId, userId);
    const userRoleInt = userRoleToInt(userRole.role);
    const minimumRoleInt = userRoleToInt(minimumRole);
    return userRoleInt >= minimumRoleInt;
  }
}
