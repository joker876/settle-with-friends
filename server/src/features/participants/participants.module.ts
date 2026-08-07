import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InviteLink, Reckoning, ReckoningUser, User } from '../../typeorm/entities';
import { NoArchivedService } from '../reckonings/no-archived.service';
import { ReckoningAccessService } from '../reckonings/reckoning-access.service';
import { InviteLinkController } from './join-from-invite.controller';
import { ParticipantsController } from './participants.controller';
import { ParticipantsService } from './participants.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, ReckoningUser, Reckoning, InviteLink])],
  controllers: [ParticipantsController, InviteLinkController],
  providers: [ParticipantsService, ReckoningAccessService, NoArchivedService],
})
export class ParticipantsModule {}
