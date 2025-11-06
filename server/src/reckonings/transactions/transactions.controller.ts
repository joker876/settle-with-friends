import { Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ITransaction } from '@shared/entities/transaction';
import { ReckoningAccess } from '../reckoning-access.guard';
import { TransactionsService } from './transactions.service';

@Controller('reckonings/:reckoningId/transactions')
@ReckoningAccess()
export class TransactionsController {
  constructor(@Inject() private readonly transactionsService: TransactionsService) {}

  @Get()
  async getAll(@Param('reckoningId') reckoningId: number): Promise<ITransaction[]> {
    return this.transactionsService.getAllForReckoning(reckoningId);
  }

  @Post()
  async createTransaction(@Param('reckoningId') reckoningId: number) {
    // TODO: implement creating transaction
    return { reckoningId };
  }
}
