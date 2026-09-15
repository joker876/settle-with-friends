import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../typeorm/entities';
import { ReckoningAccessService } from '../reckonings/reckoning-access.service';
import { AccountSettingsController } from './account-settings.controller';
import { AccountSettingsService } from './account-settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AccountSettingsController],
  providers: [AccountSettingsService, ReckoningAccessService],
})
export class AccountSettingsModule {}
