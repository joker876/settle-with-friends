import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Post, Put, Req } from '@nestjs/common';
import { Request } from 'express';
import { Return } from '../../typeorm/entities';
import { NoArchived } from '../reckonings/no-archived.guard';
import { ReckoningAccess } from '../reckonings/reckoning-access.guard';
import { CreateReturnRequestDto } from './dtos/create';
import { UpdateReturnRequestDto } from './dtos/update';
import { ReturnsService } from './returns.service';

@Controller('reckonings/:reckoningId/returns')
@ReckoningAccess()
export class ReturnsController {
  constructor(@Inject() private readonly returnsService: ReturnsService) {}

  @Get()
  async getAll(@Param('reckoningId', ParseIntPipe) reckoningId: number): Promise<Return[]> {
    return this.returnsService.getAllForReckoning(reckoningId);
  }

  @Get('recent')
  async getRecent(@Param('reckoningId', ParseIntPipe) reckoningId: number): Promise<Return[]> {
    return this.returnsService.getRecentForReckoning(reckoningId);
  }

  @Get(':returnId')
  async getById(
    @Param('reckoningId', ParseIntPipe) reckoningId: number,
    @Param('returnId', ParseIntPipe) returnId: number,
  ): Promise<Return> {
    return this.returnsService.getById(reckoningId, returnId);
  }

  @Post()
  @NoArchived()
  async createReturn(
    @Req() req: Request,
    @Param('reckoningId', ParseIntPipe) reckoningId: number,
    @Body() returnData: CreateReturnRequestDto,
  ): Promise<Return> {
    const userId = req.user!.id;

    return this.returnsService.createReturn(reckoningId, userId, returnData);
  }

  @Put(':returnId')
  @NoArchived()
  async updateReturn(
    @Req() req: Request,
    @Param('reckoningId', ParseIntPipe) reckoningId: number,
    @Param('returnId', ParseIntPipe) returnId: number,
    @Body() returnData: UpdateReturnRequestDto,
  ): Promise<Return> {
    const userId = req.user!.id;

    return this.returnsService.updateReturn(reckoningId, returnId, userId, returnData);
  }

  @Delete(':returnId')
  @NoArchived()
  async deleteReturn(
    @Req() req: Request,
    @Param('reckoningId', ParseIntPipe) reckoningId: number,
    @Param('returnId', ParseIntPipe) returnId: number,
  ): Promise<void> {
    const userId = req.user!.id;

    await this.returnsService.deleteReturn(reckoningId, returnId, userId);
  }
}
