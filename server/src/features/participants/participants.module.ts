import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reckoning, ReckoningUser, User } from '../../typeorm/entities';
import { NoArchivedService } from '../reckonings/no-archived.service';
import { ReckoningAccessService } from '../reckonings/reckoning-access.service';
import { ParticipantsController } from './participants.controller';
import { ParticipantsService } from './participants.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, ReckoningUser, Reckoning])],
  controllers: [ParticipantsController],
  providers: [ParticipantsService, ReckoningAccessService, NoArchivedService],
})
export class ParticipantsModule {}
