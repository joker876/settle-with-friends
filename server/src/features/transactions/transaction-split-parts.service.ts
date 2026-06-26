import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICreateTransactionRequestSplitPartDto } from '@shared/contracts/transactions/create';
import { IUpdateTransactionRequestSplitPartDto } from '@shared/contracts/transactions/update';
import { Repository } from 'typeorm';
import { Transaction, TransactionSplitPart, TransactionSplitPartIncludee } from '../../typeorm/entities';

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

  async syncForTransaction(
    transaction: Transaction,
    dtos: IUpdateTransactionRequestSplitPartDto[],
  ): Promise<void> {
    const existingParts = await this.partRepo.find({
      where: { transaction: { id: transaction.id } },
      relations: ['includees'],
    });
    const existingMap = new Map(existingParts.map(p => [p.id, p]));

    const incomingIds = dtos.filter(d => d.id && d.id > 0).map(d => d.id);
    const toRemove = existingParts.filter(p => !incomingIds.includes(p.id));
    if (toRemove.length) {
      await this.partRepo.remove(toRemove);
    }

    for (const dto of dtos) {
      if (dto.id && dto.id > 0) {
        const part = existingMap.get(dto.id);
        if (part) {
          part.name = dto.name;
          part.amount = dto.amount ?? null;
          await this.partRepo.save(part);
          await this.syncIncludees(part, dto.includees);
        }
      } else {
        const newPart = this.partRepo.create({ name: dto.name, amount: dto.amount ?? null, transaction });
        const saved = await this.partRepo.save(newPart);
        if (dto.includees && dto.includees.length) {
          await this.createIncludees(saved, dto.includees);
        }
      }
    }
  }

  private async createIncludees(part: TransactionSplitPart, userIds: number[]): Promise<void> {
    const ents = userIds.map(uid => this.includeeRepo.create({ userId: uid, splitPart: part }));
    await this.includeeRepo.save(ents);
  }

  private async syncIncludees(part: TransactionSplitPart, userIds: number[]): Promise<void> {
    const existing = await this.includeeRepo.find({ where: { splitPart: { id: part.id } } });
    const incoming = userIds || [];

    const toRemove = existing.filter(e => !incoming.includes(e.userId));
    if (toRemove.length) {
      await this.includeeRepo.remove(toRemove);
    }

    const existingUserIds = new Set(existing.map(e => e.userId));
    const toAdd = incoming.filter(uid => !existingUserIds.has(uid));
    if (toAdd.length) {
      const ents = toAdd.map(uid => this.includeeRepo.create({ userId: uid, splitPart: part }));
      await this.includeeRepo.save(ents);
    }
  }
}
