import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from '@shared/enums/user-role';
import { Repository } from 'typeorm';
import { UserWithRoleDto } from '../../dtos/user-with-role';
import { InviteLink, Reckoning, ReckoningUser } from '../../typeorm/entities';
import { ReckoningAccessService } from '../reckonings/reckoning-access.service';
import { GenerateInviteLinkRequestDto, GenerateInviteLinkResponseDto } from './dtos/generate-invite-link';
import { JoinFromInviteLinkResponseDto } from './dtos/join-from-invite-link';
import { UpdateUserPseudonymResponseDto } from './dtos/update-pseudonym';
import { UpdateUserRoleResponseDto } from './dtos/update-role';

@Injectable()
export class ParticipantsService {
  constructor(
    @InjectRepository(ReckoningUser) private readonly reckoningUserRepo: Repository<ReckoningUser>,
    @InjectRepository(InviteLink) private readonly inviteLinkRepo: Repository<InviteLink>,
    @InjectRepository(Reckoning) private readonly reckoningRepo: Repository<Reckoning>,
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

  async kickOrLeave(reckoningId: number, targetUserId: number, agentUserId: number): Promise<void> {
    const userRole = await this.reckoningAccessService.getUserRole(reckoningId, agentUserId);

    // only admins or higher can kick users, but users can leave themselves
    if (
      agentUserId !== targetUserId &&
      !(await this.reckoningAccessService.isUserAuthorized(reckoningId, agentUserId, UserRole.Admin, userRole.role))
    ) {
      throw new ForbiddenException('Permission denied');
    }

    // cannot kick the owner
    if (await this.reckoningAccessService.isUserAuthorized(reckoningId, targetUserId, UserRole.Owner)) {
      throw new ForbiddenException('Permission denied');
    }

    await this.reckoningUserRepo.delete({ reckoningId, userId: targetUserId });
  }

  async generateInviteLink(
    reckoningId: number,
    agentUserId: number,
    payload: GenerateInviteLinkRequestDto,
  ): Promise<GenerateInviteLinkResponseDto> {
    const userRole = await this.reckoningAccessService.getUserRole(reckoningId, agentUserId);

    // only admins or higher can generate invite links
    if (
      !(await this.reckoningAccessService.isUserAuthorized(reckoningId, agentUserId, UserRole.Admin, userRole.role))
    ) {
      throw new ForbiddenException('Permission denied');
    }

    // Generate a unique invite token
    const inviteToken = require('crypto').randomBytes(16).toString('base64url');

    const link = this.inviteLinkRepo.create({
      reckoningId,
      token: inviteToken,
      expiresAt: payload.expirationDate,
      uses: payload.userLimit,
      usesLeft: payload.userLimit,
      lastUsedAt: null,
      createdByUserId: agentUserId,
    });
    await this.inviteLinkRepo.save(link);

    return {
      token: inviteToken,
    };
  }

  async getInviteLinkData(inviteToken: string): Promise<JoinFromInviteLinkResponseDto> {
    const link = await this.inviteLinkRepo.findOne({
      where: { token: inviteToken },
      select: {
        id: true,
        reckoningId: true,
        expiresAt: true,
        usesLeft: true,
      },
    });

    if (!link || link.expiresAt < new Date() || link.usesLeft <= 0) {
      if (link) {
        this.inviteLinkRepo.delete(link.id);
      }
      throw new NotFoundException('Invite link not found or expired');
    }

    const reckoningId = link.reckoningId;

    const reckoning = await this.reckoningRepo.findOne({
      where: { id: reckoningId },
      relations: ['reckoningUsers', 'reckoningUsers.user'],
    });

    if (!reckoning) {
      throw new NotFoundException('Reckoning not found');
    }

    return {
      alreadyJoined: false,
      reckoning: {
        id: reckoning.id,
        name: reckoning.name,
        users: reckoning.reckoningUsers.map(reckUser => reckUser.user),
        createdAt: reckoning.createdDate,
        updatedAt: reckoning.updatedDate,
      },
    };
  }

  async joinWithInviteLink(userId: number, inviteToken: string): Promise<void> {
    const link = await this.inviteLinkRepo.findOne({
      where: { token: inviteToken },
      select: {
        id: true,
        reckoningId: true,
        expiresAt: true,
        usesLeft: true,
      },
    });
    if (!link || link.expiresAt < new Date() || link.usesLeft <= 0) {
      if (link) {
        this.inviteLinkRepo.delete(link.id);
      }
      throw new NotFoundException('Invite link not found or expired');
    }

    const reckoningId = link.reckoningId;

    const alreadyJoined = await this.reckoningUserRepo.exists({ where: { reckoningId, userId } });
    if (alreadyJoined) {
      throw new ConflictException('Already joined the reckoning');
    }

    const newReckoningUser = this.reckoningUserRepo.create({
      reckoningId,
      userId,
      role: UserRole.Member,
      pseudonym: undefined,
    });
    await this.reckoningUserRepo.save(newReckoningUser);

    await this.inviteLinkRepo.update(link.id, { usesLeft: link.usesLeft - 1, lastUsedAt: new Date() });
  }
}
