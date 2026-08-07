import { Controller, Get, Inject, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { JoinFromInviteLinkResponseDto } from './dtos/join-from-invite-link';
import { ParticipantsService } from './participants.service';

@Controller('invite-link/:token')
export class InviteLinkController {
  constructor(@Inject() private readonly participantsService: ParticipantsService) {}

  @Get('data')
  async getTokenData(@Param('token') token: string, @Req() req: Request): Promise<JoinFromInviteLinkResponseDto> {
    const agentUserId = req.user!.id;
    return this.participantsService.getInviteLinkData(token);
  }

  @Post('join')
  async join(@Param('token') token: string, @Req() req: Request) {
    const agentUserId = req.user!.id;
    return this.participantsService.joinWithInviteLink(agentUserId, token);
  }
}
