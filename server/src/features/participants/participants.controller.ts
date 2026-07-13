import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Patch, Req } from '@nestjs/common';
import { Request } from 'express';
import { UserWithRoleDto } from '../../dtos/user-with-role';
import { ReckoningAccess } from '../reckonings/reckoning-access.guard';
import { UpdateUserPseudonymRequestDto, UpdateUserPseudonymResponseDto } from './dtos/update-pseudonym';
import { UpdateUserRoleRequestDto, UpdateUserRoleResponseDto } from './dtos/update-role';
import { ParticipantsService } from './participants.service';

@Controller('reckonings/:reckoningId/participants')
@ReckoningAccess()
export class ParticipantsController {
  constructor(@Inject() private readonly participantsService: ParticipantsService) {}

  @Get()
  async getAll(@Param('reckoningId', ParseIntPipe) reckoningId: number): Promise<UserWithRoleDto[]> {
    return this.participantsService.getAllForReckoning(reckoningId);
  }

  @Patch(':userId/role')
  async updateRole(
    @Param('reckoningId', ParseIntPipe) reckoningId: number,
    @Param('userId', ParseIntPipe) targetUserId: number,
    @Body() body: UpdateUserRoleRequestDto,
    @Req() req: Request,
  ): Promise<UpdateUserRoleResponseDto> {
    const agentUserId = req.user!.id;
    return this.participantsService.updateUserRole(reckoningId, targetUserId, agentUserId, body.role);
  }

  @Patch(':userId/pseudonym')
  async updatePseudonym(
    @Param('reckoningId', ParseIntPipe) reckoningId: number,
    @Param('userId', ParseIntPipe) targetUserId: number,
    @Body() body: UpdateUserPseudonymRequestDto,
    @Req() req: Request,
  ): Promise<UpdateUserPseudonymResponseDto> {
    const agentUserId = req.user!.id;
    return this.participantsService.updateUserPseudonym(reckoningId, targetUserId, agentUserId, body.pseudonym);
  }

  @Delete(':userId/kick-or-leave')
  async kickOrLeave(
    @Param('reckoningId', ParseIntPipe) reckoningId: number,
    @Param('userId', ParseIntPipe) targetUserId: number,
    @Req() req: Request,
  ): Promise<void> {
    const agentUserId = req.user!.id;
    return this.participantsService.kickOrLeave(reckoningId, targetUserId, agentUserId);
  }
}
