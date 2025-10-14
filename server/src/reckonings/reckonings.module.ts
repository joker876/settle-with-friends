import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reckoning, User } from '../typeorm/entities';
import { ReckoningsController } from './reckonings.controller';
import { ReckoningsService } from './reckonings.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reckoning, User])],
  controllers: [ReckoningsController],
  providers: [ReckoningsService],
})
export class ReckoningsModule {}
