import { Controller, Get, Inject, Param, ParseIntPipe, Req } from '@nestjs/common';
import { Request } from 'express';
import { ReckoningAccess } from '../reckonings/reckoning-access.guard';
import { getUserIdFromRequest } from '../utils/get-user-id';
import { SummaryService } from './summary.service';

@Controller('reckonings/:reckoningId/summary')
@ReckoningAccess()
export class SummaryController {
  constructor(@Inject() private readonly summaryService: SummaryService) {}

  @Get('basic')
  async getBasic(@Param('reckoningId', ParseIntPipe) reckoningId: number, @Req() req: Request): Promise<any> {
    const userId = getUserIdFromRequest(req);
    return this.summaryService.getBasic(reckoningId, userId);
  }
}
