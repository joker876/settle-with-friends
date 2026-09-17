import { Body, Controller, Delete, Get, Inject, Patch, Req } from '@nestjs/common';
import { Request } from 'express';
import { getUserIdFromRequest } from '../../utils/get-user-id';
import { AccountSettingsService } from './account-settings.service';
import { GetAccountSettingsResponse } from './dtos/get';
import { UpdateAccountSettingsRequest } from './dtos/patch';

@Controller('account-settings')
export class AccountSettingsController {
  constructor(@Inject() private readonly accountSettingsService: AccountSettingsService) {}

  @Get()
  async get(@Req() req: Request): Promise<GetAccountSettingsResponse> {
    const userId = getUserIdFromRequest(req);
    return this.accountSettingsService.get(userId);
  }

  @Patch()
  async patch(@Req() req: Request, @Body() dto: UpdateAccountSettingsRequest): Promise<void> {
    const userId = getUserIdFromRequest(req);
    return this.accountSettingsService.patch(userId, dto);
  }

  @Delete()
  async deleteAccount(@Req() req: Request): Promise<void> {
    const userId = getUserIdFromRequest(req);
    return this.accountSettingsService.deleteAccount(userId);
  }
}
