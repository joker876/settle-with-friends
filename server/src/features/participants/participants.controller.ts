import { Controller, Get, Inject, Param, ParseIntPipe } from '@nestjs/common';
import { ReckoningAccess } from '../reckonings/reckoning-access.guard';
import { UserWithRoleDto } from './dtos/get-users';
import { ParticipantsService } from './participants.service';

@Controller('reckonings/:reckoningId/participants')
@ReckoningAccess()
export class ParticipantsController {
  constructor(@Inject() private readonly participantsService: ParticipantsService) {}

  @Get()
  async getAll(@Param('reckoningId', ParseIntPipe) reckoningId: number): Promise<UserWithRoleDto[]> {
    return this.participantsService.getAllForReckoning(reckoningId);
  }
}
