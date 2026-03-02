import { BadRequestException, Injectable } from '@nestjs/common';
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
  ): Promise<Transaction> {
    const payersRemainingAmount =
      transactionData.transaction.amount - transactionData.payers.reduce((acc, v) => acc + (v.amount ?? 0), 0);
    const payersNumberOfNullAmounts = transactionData.payers.reduce((acc, v) => (v.amount === null ? acc + 1 : acc), 0);
    if (payersRemainingAmount > 0) {
      if (payersNumberOfNullAmounts === 0) {
        throw new BadRequestException(`payers amounts must sum to the transaction amount`);
      }
      if (payersNumberOfNullAmounts > 1) {
        throw new BadRequestException(`payers can only have one null amount`);
      }
    }

    const splitPartsRemainingAmount =
      transactionData.transaction.amount - transactionData.splitParts.reduce((acc, v) => acc + (v.amount ?? 0), 0);
    const splitPartsNumberOfNullAmounts = transactionData.splitParts.reduce(
      (acc, v) => (v.amount === null ? acc + 1 : acc),
      0,
    );
    if (splitPartsRemainingAmount > 0) {
      if (splitPartsNumberOfNullAmounts === 0) {
        throw new BadRequestException(`splitParts amounts must sum to the transaction amount`);
      }
      if (splitPartsNumberOfNullAmounts > 1) {
        throw new BadRequestException(`splitParts can only have one null amount`);
      }
    }

    const payers = await Promise.all(
      transactionData.payers.map(p => {
        const payer = this.transactionPayerRepo.create({
          user: { id: p.userId },
          amount: p.amount,
        });
        return this.transactionPayerRepo.save(payer);
      }),
    );
    const splitParts = await Promise.all(
      transactionData.splitParts.map(async sp => {
        const includees = await Promise.all(
          sp.includees.map(incl => {
            const includee = this.transactionSplitPartIncludeeRepo.create({
              user: { id: incl },
            });
            return this.transactionSplitPartIncludeeRepo.save(includee);
          }),
        );
        const splitPart = this.transactionSplitPartRepo.create({
          ...sp,
          includees,
        });
        return this.transactionSplitPartRepo.save(splitPart);
      }),
    );

    const transaction = this.transactionRepo.create({
      ...transactionData.transaction,
      createdBy: { id: userId },
      updatedBy: { id: userId },
      reckoning: { id: reckoningId },
      payers,
      splitParts,
    });
    return this.transactionRepo.save(transaction);
  }
}
