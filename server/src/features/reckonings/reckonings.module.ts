import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reckoning, ReckoningUser, User } from '../../typeorm/entities';
import { NoArchivedService } from './no-archived.service';
import { ReckoningAccessService } from './reckoning-access.service';
import { ReckoningsController } from './reckonings.controller';
import { ReckoningsService } from './reckonings.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Reckoning, ReckoningUser])],
  controllers: [ReckoningsController],
  providers: [ReckoningsService, ReckoningAccessService, NoArchivedService],
})
export class ReckoningsModule {}
