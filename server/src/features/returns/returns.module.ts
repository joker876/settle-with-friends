import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reckoning, Return, User } from '../../typeorm/entities';
import { NoArchivedService } from '../reckonings/no-archived.service';
import { ReckoningAccessService } from '../reckonings/reckoning-access.service';
import { ReturnsController } from './returns.controller';
import { ReturnsService } from './returns.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Return, Reckoning]),
  ],
  controllers: [ReturnsController],
  providers: [ReturnsService, ReckoningAccessService, NoArchivedService],
})
export class ReturnsModule {}
