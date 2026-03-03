import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICreateTransactionRequestSplitPartDto } from '@shared/contracts/transactions/create';
import { Repository } from 'typeorm';
import {
    Transaction,
    TransactionSplitPart,
    TransactionSplitPartIncludee,
} from '../../typeorm/entities';

@Injectable()
export class TransactionSplitPartsService {
  constructor(
    @InjectRepository(TransactionSplitPart)
    private readonly partRepo: Repository<TransactionSplitPart>,
    @InjectRepository(TransactionSplitPartIncludee)
    private readonly includeeRepo: Repository<TransactionSplitPartIncludee>,
  ) {}

  async createForTransaction(
    transaction: Transaction,
    splitParts: ICreateTransactionRequestSplitPartDto[],
  ): Promise<TransactionSplitPart[]> {
    if (!splitParts || splitParts.length === 0) return [];

    const partEntities = splitParts.map(p =>
      this.partRepo.create({ name: p.name, amount: p.amount ?? null, transaction }),
    );

    const savedParts = await this.partRepo.save(partEntities);

    const includeeEntities: TransactionSplitPartIncludee[] = [];

    for (let i = 0; i < savedParts.length; i++) {
      const includeeIds = splitParts[i].includees || [];
      for (const userId of includeeIds) {
        includeeEntities.push(
          this.includeeRepo.create({ userId, splitPart: savedParts[i] }),
        );
      }
    }

    if (includeeEntities.length) {
      await this.includeeRepo.save(includeeEntities);
    }

    return savedParts;
  }
}
