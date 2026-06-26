import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment, User } from '../../typeorm/entities';
import { ReckoningAccessService } from '../reckonings/reckoning-access.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Payment]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, ReckoningAccessService],
})
export class PaymentsModule {}
