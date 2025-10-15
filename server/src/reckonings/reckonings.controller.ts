import { Body, Controller, Get, Inject, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { CreateReckoningRequestDto } from './dtos/create';
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
}
