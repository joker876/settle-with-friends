import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICreateTransactionRequestDto } from '@shared/contracts/transactions/create';
import { IUpdateTransactionRequestDto } from '@shared/contracts/transactions/update';
import { Repository } from 'typeorm';
import { Transaction } from '../typeorm/entities';
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
      order: {
        transactionDate: 'ASC',
        createdDate: 'ASC',
      },
    });
  }

  async getRecentForReckoning(id: number): Promise<Transaction[]> {
    return this.transactionRepo.find({
      relations: {
        payers: {},
        splitParts: { includees: {} },
      },
      where: {
        reckoning: { id },
      },
      order: {
        updatedDate: 'DESC',
      },
      take: 5,
    });
  }

  async getById(reckoningId: number, transactionId: number): Promise<Transaction> {
    const tx = await this.transactionRepo.findOne({
      relations: {
        payers: {},
        splitParts: { includees: {} },
      },
      where: {
        id: transactionId,
        reckoning: { id: reckoningId },
      },
    });
    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }
    return tx;
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

    return (await this.transactionRepo.findOne({
      relations: { payers: {}, splitParts: { includees: {} } },
      where: { id: savedTx.id },
    }))!;
  }

  async updateTransaction(
    reckoningId: number,
    transactionId: number,
    userId: number,
    transactionData: IUpdateTransactionRequestDto,
  ): Promise<Transaction> {
    const tx = await this.transactionRepo.findOne({
      where: { id: transactionId, reckoning: { id: reckoningId } },
    });
    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }

    // update basic fields
    Object.assign(tx, transactionData.transaction);
    tx.updatedByUserId = userId;
    const savedTx = await this.transactionRepo.save(tx);

    // sync related entities
    await this.payerService.syncForTransaction(savedTx, transactionData.payers);
    await this.splitPartService.syncForTransaction(savedTx, transactionData.splitParts);

    return (await this.transactionRepo.findOne({
      relations: { payers: {}, splitParts: { includees: {} } },
      where: { id: savedTx.id },
    }))!;
  }

  async deleteTransaction(reckoningId: number, transactionId: number): Promise<void> {
    const tx = await this.transactionRepo.findOne({
      where: { id: transactionId, reckoning: { id: reckoningId } },
    });
    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }

    await this.transactionRepo.remove(tx);
  }
}
