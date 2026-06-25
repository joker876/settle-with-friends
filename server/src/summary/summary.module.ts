import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReckoningAccessService } from '../reckonings/reckoning-access.service';
import { Payment, Transaction, User } from '../typeorm/entities';
import { SummaryController } from './summary.controller';
import { SummaryService } from './summary.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Transaction, Payment])],
  controllers: [SummaryController],
  providers: [SummaryService, ReckoningAccessService],
})
export class SummaryModule {}
