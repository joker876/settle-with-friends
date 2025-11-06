import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { CreateReckoningRequestDto } from './dtos/create';
import { ReckoningAccess } from './reckoning-access.guard';
import { ReckoningsService } from './reckonings.service';

@Controller('reckonings')
export class ReckoningsController {
  constructor(@Inject(ReckoningsService) private readonly reckoningsService: ReckoningsService) {}

  @Get()
  getAll(@Req() req: Request) {
    const userId = req.user!.id;

    return this.reckoningsService.getAllForUser(userId);
  }

  @Post()
  create(@Req() req: Request, @Body() body: CreateReckoningRequestDto) {
    const userId = req.user!.id;

    return this.reckoningsService.create(body, userId);
  }

  @Get(':reckoningId/users')
  @ReckoningAccess()
  getAllUsersInReckoning(@Param('reckoningId', ParseIntPipe) reckoningId: number) {
    return this.reckoningsService.getAllUsersInReckoning(reckoningId);
  }
}
