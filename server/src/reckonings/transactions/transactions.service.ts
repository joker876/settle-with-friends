import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICreateTransactionRequestDto } from '@shared/contracts/transactions/create';
import { Repository } from 'typeorm';
import {
  Transaction,
  TransactionPayer,
  TransactionSplitPart,
  TransactionSplitPartIncludee
} from '../../typeorm/entities';

@Injectable()
export class TransactionsService {
  constructor(@InjectRepository(Transaction) private readonly transactionRepo: Repository<Transaction>) {}

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
    const { transaction: txBasic, payers, splitParts } = transactionData;

    return this.transactionRepo.manager.transaction(async manager => {
      const tx = manager.create(Transaction, {
        ...txBasic,
        createdByUserId: userId,
        updatedByUserId: userId,
        reckoning: { id: reckoningId } as any,
      });

      const savedTx = await manager.save(Transaction, tx);

      if (payers && payers.length) {
        const payerEntities = payers.map(p =>
          manager.create(TransactionPayer, { userId: p.userId, amount: p.amount ?? null, transaction: savedTx }),
        );

        await manager.save(TransactionPayer, payerEntities);
      }

      if (splitParts && splitParts.length) {
        const partEntities = splitParts.map(p =>
          manager.create(TransactionSplitPart, { name: p.name, amount: p.amount ?? null, transaction: savedTx }),
        );

        const savedParts = await manager.save(TransactionSplitPart, partEntities);

        const includeeEntities: TransactionSplitPartIncludee[] = [];

        for (let i = 0; i < savedParts.length; i++) {
          const includeeIds = splitParts[i].includees || [];
          for (const includeeUserId of includeeIds) {
            includeeEntities.push(
              manager.create(TransactionSplitPartIncludee, { userId: includeeUserId, splitPart: savedParts[i] }),
            );
          }
        }

        if (includeeEntities.length) {
          await manager.save(TransactionSplitPartIncludee, includeeEntities);
        }
      }

      return (await manager.findOne(Transaction, {
        relations: { payers: {}, splitParts: { includees: {} } },
        where: { id: savedTx.id },
      })) as Transaction;
    });
  }
}
