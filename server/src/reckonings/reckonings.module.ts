import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reckoning, ReckoningUser, User } from '../typeorm/entities';
import { ReckoningAccessService } from './reckoning-access.service';
import { ReckoningsController } from './reckonings.controller';
import { ReckoningsService } from './reckonings.service';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Reckoning, ReckoningUser]), TransactionsModule],
  controllers: [ReckoningsController],
  providers: [ReckoningsService, ReckoningAccessService],
})
export class ReckoningsModule {}
