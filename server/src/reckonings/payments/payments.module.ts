import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../typeorm/entities';
import { Payment } from '../../typeorm/entities/Payment';
import { ReckoningAccessService } from '../reckoning-access.service';
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
