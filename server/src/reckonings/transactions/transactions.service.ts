import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICreateTransactionRequestDto } from '@shared/contracts/transactions/create';
import { Repository } from 'typeorm';
import { Transaction } from '../../typeorm/entities';
import { TransactionPayersService } from './transaction-payers.service';
import { TransactionSplitPartsService } from './transaction-split-parts.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction) private readonly transactionRepo: Repository<Transaction>,
    private readonly payerService: TransactionPayersService,
    private readonly splitPartService: TransactionSplitPartsService,
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
    const { transaction: txBasic, payers, splitParts } = transactionData;

    // create base transaction record
    const tx = this.transactionRepo.create({
      ...txBasic,
      createdByUserId: userId,
      updatedByUserId: userId,
      reckoning: { id: reckoningId } as any,
    });

    const savedTx = await this.transactionRepo.save(tx);

    // delegate creation of related entities to dedicated services
    if (payers && payers.length) {
      await this.payerService.createForTransaction(savedTx, payers);
    }

    if (splitParts && splitParts.length) {
      await this.splitPartService.createForTransaction(savedTx, splitParts);
    }

    return this.transactionRepo.findOne({
      relations: { payers: {}, splitParts: { includees: {} } },
      where: { id: savedTx.id },
    }) as Promise<Transaction>;
  }
}
