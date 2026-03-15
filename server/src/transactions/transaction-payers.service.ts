import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICreateTransactionRequestPayerDto } from '@shared/contracts/transactions/create';
import { IUpdateTransactionRequestPayerDto } from '@shared/contracts/transactions/update';
import { Repository } from 'typeorm';
import { Transaction, TransactionPayer } from '../typeorm/entities';

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

    const entities = payers.map(p => this.repo.create({ userId: p.userId, amount: p.amount ?? null, transaction }));

    return this.repo.save(entities);
  }

  async syncForTransaction(transaction: Transaction, dtos: IUpdateTransactionRequestPayerDto[]): Promise<void> {
    const existing = await this.repo.find({ where: { transaction: { id: transaction.id } } });
    const existingMap = new Map(existing.map(p => [p.id, p]));
    const incomingIds = dtos.filter(d => d.id && d.id > 0).map(d => d.id);

    // classify incoming dtos
    const toCreate = dtos.filter(d => !d.id || d.id <= 0);
    const toUpdate = dtos.filter(d => d.id && d.id > 0 && existingMap.has(d.id));
    const toRemove = existing.filter(p => !incomingIds.includes(p.id));

    await this.deletePayers(toRemove);
    await this.updatePayers(existingMap, toUpdate);
    await this.createPayers(transaction, toCreate);
  }

  private async createPayers(transaction: Transaction, dtos: IUpdateTransactionRequestPayerDto[]): Promise<void> {
    if (!dtos.length) return;
    const ents = dtos.map(d => this.repo.create({ userId: d.userId, amount: d.amount ?? null, transaction }));
    await this.repo.save(ents);
  }

  private async updatePayers(
    existingMap: Map<number, TransactionPayer>,
    dtos: IUpdateTransactionRequestPayerDto[],
  ): Promise<void> {
    for (const dto of dtos) {
      const ent = existingMap.get(dto.id);
      if (ent) {
        ent.userId = dto.userId;
        ent.amount = dto.amount ?? null;
        await this.repo.save(ent);
      }
    }
  }

  private async deletePayers(payers: TransactionPayer[]): Promise<void> {
    if (payers.length) {
      await this.repo.remove(payers);
    }
  }
}
