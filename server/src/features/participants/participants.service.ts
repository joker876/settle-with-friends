import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from '@shared/enums/user-role';
import { Repository } from 'typeorm';
import { UserWithRoleDto } from '../../dtos/user-with-role';
import { ReckoningUser } from '../../typeorm/entities';
import { ReckoningAccessService } from '../reckonings/reckoning-access.service';
import { UpdateUserPseudonymResponseDto } from './dtos/update-pseudonym';
import { UpdateUserRoleResponseDto } from './dtos/update-role';

@Injectable()
export class ParticipantsService {
  constructor(
    @InjectRepository(ReckoningUser) private readonly reckoningUserRepo: Repository<ReckoningUser>,
    private readonly reckoningAccessService: ReckoningAccessService,
  ) {}

  async getAllForReckoning(reckoningId: number): Promise<UserWithRoleDto[]> {
    return await this.reckoningUserRepo
      .find({
        where: { reckoningId },
        relations: ['user'],
      })
      .then(reckUsers =>
        reckUsers.map(reckUser => ({
          id: reckUser.userId,
          displayName: reckUser.pseudonym ?? reckUser.user.displayName,
          email: reckUser.user.email,
          photo: reckUser.user.photo,
          role: reckUser.role,
        })),
      );
  }

  async updateUserRole(
    reckoningId: number,
    targetUserId: number,
    agentUserId: number,
    newRole: UserRole,
  ): Promise<UpdateUserRoleResponseDto> {
    const userRole = await this.reckoningAccessService.getUserRole(reckoningId, agentUserId);
    // cannot change the owner
    if (newRole === UserRole.Owner) {
      throw new ForbiddenException('Permission denied');
    }
    // only owners can change roles
    if (
      !(await this.reckoningAccessService.isUserAuthorized(reckoningId, agentUserId, UserRole.Owner, userRole.role))
    ) {
      throw new ForbiddenException('Permission denied');
    }

    const targetUserRole = await this.reckoningAccessService.getUserRole(reckoningId, targetUserId);
    // cannot change the owner
    if (targetUserRole.role === UserRole.Owner) {
      throw new ForbiddenException('Permission denied');
    }
    await this.reckoningUserRepo.update({ reckoningId, userId: targetUserId }, { role: newRole });

    return { role: newRole };
  }

  async updateUserPseudonym(
    reckoningId: number,
    targetUserId: number,
    agentUserId: number,
    newPseudonym: string,
  ): Promise<UpdateUserPseudonymResponseDto> {
    // only admins or higher can change pseudonyms, but users can change their own pseudonym
    if (
      agentUserId !== targetUserId &&
      !(await this.reckoningAccessService.isUserAuthorized(reckoningId, agentUserId, UserRole.Admin))
    ) {
      throw new ForbiddenException('Permission denied');
    }

    await this.reckoningUserRepo.update({ reckoningId, userId: targetUserId }, { pseudonym: newPseudonym });

    return { pseudonym: newPseudonym };
  }
}
