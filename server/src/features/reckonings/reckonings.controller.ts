import { Body, Controller, Get, Inject, Param, ParseIntPipe, Patch, Post, Req } from '@nestjs/common';
import { UserRole } from '@shared/enums/user-role';
import { Request } from 'express';
import { CreateReckoningRequestDto } from './dtos/create';
import { ReckoningAccess } from './reckoning-access.guard';
import { ReckoningAccessService } from './reckoning-access.service';
import { ReckoningsService } from './reckonings.service';

@Controller('reckonings')
export class ReckoningsController {
  constructor(
    @Inject(ReckoningsService) private readonly reckoningsService: ReckoningsService,
    @Inject(ReckoningAccessService) private readonly accessService: ReckoningAccessService,
  ) {}

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

  @Get(':reckoningId')
  @ReckoningAccess()
  getReckoning(@Param('reckoningId', ParseIntPipe) reckoningId: number) {
    return this.reckoningsService.getById(reckoningId);
  }

  @Get(':reckoningId/role')
  async getRole(@Param('reckoningId', ParseIntPipe) reckoningId: number, @Req() req: Request): Promise<{ role: UserRole }> {
    return this.accessService.getUserRole(reckoningId, req.user?.id);
  }

  @Patch(':reckoningId/archive')
  @ReckoningAccess()
  async archive(@Param('reckoningId', ParseIntPipe) reckoningId: number, @Req() req: Request): Promise<void> {
    return this.reckoningsService.archive(reckoningId, req.user!.id);
  }

  @Patch(':reckoningId/unarchive')
  @ReckoningAccess()
  async unarchive(@Param('reckoningId', ParseIntPipe) reckoningId: number, @Req() req: Request): Promise<void> {
    return this.reckoningsService.unarchive(reckoningId, req.user!.id);
  }
}
