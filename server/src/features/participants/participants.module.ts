import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReckoningUser, User } from '../../typeorm/entities';
import { ReckoningAccessService } from '../reckonings/reckoning-access.service';
import { ParticipantsController } from './participants.controller';
import { ParticipantsService } from './participants.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, ReckoningUser])],
  controllers: [ParticipantsController],
  providers: [ParticipantsService, ReckoningAccessService],
})
export class ParticipantsModule {}
