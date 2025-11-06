import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../typeorm/entities';
import { Transaction } from '../../typeorm/entities/Transaction';
import { ReckoningAccessService } from '../reckoning-access.service';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Transaction])],
  controllers: [TransactionsController],
  providers: [TransactionsService, ReckoningAccessService],
})
export class TransactionsModule {}
