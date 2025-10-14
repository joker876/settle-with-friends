import { Controller, Get, Inject, Req } from '@nestjs/common';
import { Request } from 'express';
import { ReckoningsService } from './reckonings.service';

@Controller('reckonings')
export class ReckoningsController {
  constructor(@Inject(ReckoningsService) private readonly reckoningsService: ReckoningsService) {}

  @Get()
  getAll(@Req() req: Request) {
    const userId = req.user!.id;

    return this.reckoningsService.getAllForUser(userId);
  }
}
