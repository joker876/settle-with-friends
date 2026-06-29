import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Return, Transaction, User } from '../../typeorm/entities';
import { ReckoningAccessService } from '../reckonings/reckoning-access.service';
import { SummaryController } from './summary.controller';
import { SummaryService } from './summary.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Transaction, Return])],
  controllers: [SummaryController],
  providers: [SummaryService, ReckoningAccessService],
})
export class SummaryModule {}
