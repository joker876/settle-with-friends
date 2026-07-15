import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reckoning, Transaction, TransactionPayer, TransactionSplitPart, TransactionSplitPartIncludee, User } from '../../typeorm/entities';
import { NoArchivedService } from '../reckonings/no-archived.service';
import { ReckoningAccessService } from '../reckonings/reckoning-access.service';
import { TransactionPayersService } from './transaction-payers.service';
import { TransactionSplitPartsService } from './transaction-split-parts.service';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Transaction, TransactionPayer, TransactionSplitPart, TransactionSplitPartIncludee, Reckoning]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, ReckoningAccessService, NoArchivedService, TransactionPayersService, TransactionSplitPartsService],
})
export class TransactionsModule {}
