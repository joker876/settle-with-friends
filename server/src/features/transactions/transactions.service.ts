import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICreateTransactionRequestDto } from '@shared/contracts/transactions/create';
import { IUpdateTransactionRequestDto } from '@shared/contracts/transactions/update';
import { UserRole } from '@shared/enums/user-role';
import { roundToPrecision } from 'more-rounding';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { ReckoningAccessService } from '../reckonings/reckoning-access.service';
import { Transaction } from './../../typeorm/entities/Transaction';
import { TransactionPayersService } from './transaction-payers.service';
import { TransactionSplitPartsService } from './transaction-split-parts.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction) private readonly transactionRepo: Repository<Transaction>,
    private readonly payerService: TransactionPayersService,
    private readonly splitPartService: TransactionSplitPartsService,
    private readonly accessService: ReckoningAccessService,
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

  @Transactional()
  async createTransaction(
    reckoningId: number,
    userId: number,
    transactionData: ICreateTransactionRequestDto,
  ): Promise<Transaction> {
    const { transaction: txBasic, payers, splitParts } = transactionData;

    if (payers.every(p => p.amount !== null)) {
      const payersSum =  payers.reduce((sum, p) => sum + p.amount!, 0);

      if (roundToPrecision(payersSum, 5) !== txBasic.amount) {
        throw new BadRequestException(`Sum of payers amounts (${payersSum}) does not match transaction amount (${txBasic.amount})`);
      }
    }
    if (splitParts.every(p => p.amount !== null)) {
      const splitPartsSum =  splitParts.reduce((sum, p) => sum + p.amount!, 0);

      if (roundToPrecision(splitPartsSum, 5) !== txBasic.amount) {
        throw new BadRequestException(`Sum of split parts amounts (${splitPartsSum}) does not match transaction amount (${txBasic.amount})`);
      }
    }

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

  @Transactional()
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

  async deleteTransaction(reckoningId: number, transactionId: number, userId: number): Promise<void> {
    const tx = await this.transactionRepo.findOne({
      where: { id: transactionId, reckoning: { id: reckoningId } },
    });
    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }
    if (
      tx.createdByUserId !== userId &&
      !(await this.accessService.isUserAuthorized(reckoningId, userId, UserRole.Admin))
    ) {
      throw new UnauthorizedException('Unauthorized');
    }

    await this.transactionRepo.remove(tx);
  }
}
