import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, Req } from '@nestjs/common';
import { ITransaction } from '@shared/entities/transaction';
import { Request } from 'express';
import { ReckoningAccess } from '../reckoning-access.guard';
import { CreateTransactionRequestDto } from './dtos/create';
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
}
