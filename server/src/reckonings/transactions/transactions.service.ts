import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICreateTransactionRequestDto } from '@shared/contracts/transactions/create';
import { Repository } from 'typeorm';
import {
  Transaction,
  TransactionPayer,
  TransactionSplitPart,
  TransactionSplitPartIncludee,
  User,
} from '../../typeorm/entities';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Transaction) private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(TransactionPayer) private readonly transactionPayerRepo: Repository<TransactionPayer>,
    @InjectRepository(TransactionSplitPart) private readonly transactionSplitPartRepo: Repository<TransactionSplitPart>,
    @InjectRepository(TransactionSplitPartIncludee)
    private readonly transactionSplitPartIncludeeRepo: Repository<TransactionSplitPartIncludee>,
  ) {}

  async getAllForReckoning(id: number): Promise<Transaction[]> {
    return this.transactionRepo.find({
      relations: {
        payers: {},
        splitParts: { includees: {} },
      },
      where: {
        reckoning: { id },
      },
    });
  }

  async createTransaction(
    reckoningId: number,
    userId: number,
    transactionData: ICreateTransactionRequestDto,
  ): Promise<Transaction | number> {
    const transaction = this.transactionRepo.create({
      ...transactionData.transaction,
      createdBy: { id: userId },
      updatedBy: { id: userId },
      reckoning: { id: reckoningId },
      payers: transactionData.payers.map(p =>
        this.transactionPayerRepo.create({
          user: { id: p.userId },
          amount: p.amount,
        }),
      ),
      splitParts: transactionData.splitParts.map(sp =>
        this.transactionSplitPartRepo.create({
          ...sp,
          includees: sp.includees.map(i =>
            this.transactionSplitPartIncludeeRepo.create({
              user: { id: i },
            }),
          ),
        }),
      ),
    });
    return this.transactionRepo.save(transaction).then(t => t[0]);
  }
}
