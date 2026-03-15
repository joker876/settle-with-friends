import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Post, Put, Req } from '@nestjs/common';
import { ITransaction } from '@shared/entities/transaction';
import { Request } from 'express';
import { ReckoningAccess } from '../reckonings/reckoning-access.guard';
import { CreateTransactionRequestDto } from './dtos/create';
import { UpdateTransactionRequestDto } from './dtos/update';
import { TransactionsService } from './transactions.service';

@Controller('reckonings/:reckoningId/transactions')
@ReckoningAccess()
export class TransactionsController {
  constructor(@Inject() private readonly transactionsService: TransactionsService) {}

  @Get()
  async getAll(@Param('reckoningId', ParseIntPipe) reckoningId: number): Promise<ITransaction[]> {
    return this.transactionsService.getAllForReckoning(reckoningId);
  }

  @Post()
  async createTransaction(
    @Req() req: Request,
    @Param('reckoningId', ParseIntPipe) reckoningId: number,
    @Body() transactionData: CreateTransactionRequestDto,
  ): Promise<ITransaction> {
    const userId = req.user!.id;

    return this.transactionsService.createTransaction(reckoningId, userId, transactionData);
  }

  @Put(':transactionId')
  async updateTransaction(
    @Req() req: Request,
    @Param('reckoningId', ParseIntPipe) reckoningId: number,
    @Param('transactionId', ParseIntPipe) transactionId: number,
    @Body() transactionData: UpdateTransactionRequestDto,
  ): Promise<ITransaction> {
    const userId = req.user!.id;

    return this.transactionsService.updateTransaction(reckoningId, transactionId, userId, transactionData);
  }

  @Delete(':transactionId')
  async deleteTransaction(
    @Param('reckoningId', ParseIntPipe) reckoningId: number,
    @Param('transactionId', ParseIntPipe) transactionId: number,
  ): Promise<void> {
    await this.transactionsService.deleteTransaction(reckoningId, transactionId);
  }
}
