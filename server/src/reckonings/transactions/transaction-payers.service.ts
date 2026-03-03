import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICreateTransactionRequestPayerDto } from '@shared/contracts/transactions/create';
import { Repository } from 'typeorm';
import { Transaction, TransactionPayer } from '../../typeorm/entities';

@Injectable()
export class TransactionPayersService {
  constructor(
    @InjectRepository(TransactionPayer)
    private readonly repo: Repository<TransactionPayer>,
  ) {}

  async createForTransaction(
    transaction: Transaction,
    payers: ICreateTransactionRequestPayerDto[],
  ): Promise<TransactionPayer[]> {
    if (!payers || payers.length === 0) return [];

    const entities = payers.map(p =>
      this.repo.create({ userId: p.userId, amount: p.amount ?? null, transaction }),
    );

    return this.repo.save(entities);
  }
}
