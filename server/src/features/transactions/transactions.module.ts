import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction, TransactionPayer, TransactionSplitPart, TransactionSplitPartIncludee, User } from '../../typeorm/entities';
import { ReckoningAccessService } from '../reckonings/reckoning-access.service';
import { TransactionPayersService } from './transaction-payers.service';
import { TransactionSplitPartsService } from './transaction-split-parts.service';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Transaction, TransactionPayer, TransactionSplitPart, TransactionSplitPartIncludee]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, ReckoningAccessService, TransactionPayersService, TransactionSplitPartsService],
})
export class TransactionsModule {}
