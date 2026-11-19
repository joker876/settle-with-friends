import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { roundToPrecision } from 'more-rounding';
import { In, Repository } from 'typeorm';
import { ReckoningUser, Return, Transaction } from '../../typeorm/entities';
import { GetBasicSummaryResponseDto } from './dtos/get-basic';
import { GetDetailedSummaryResponseDto, PersonalSummaryDto } from './dtos/get-detailed';

@Injectable()
export class SummaryService {
  constructor(
    @InjectRepository(Return) private readonly returnRepo: Repository<Return>,
    @InjectRepository(Transaction) private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(ReckoningUser) private readonly reckoningUserRepo: Repository<ReckoningUser>,
  ) {}

  private getPayerAmount(transaction: Transaction, userId: number): number {
    const payer = transaction.payers.find(p => p.userId === userId);
    if (!payer) return 0;
    if (payer.amount !== null) return payer.amount;

    const explicitlyPaid = transaction.payers.reduce((sum, p) => sum + (p.amount ?? 0), 0);
    return transaction.amount - explicitlyPaid;
  }

  private getSplitPartAmount(transaction: Transaction, splitPart: Transaction['splitParts'][number]): number {
    if (splitPart.amount !== null) return splitPart.amount;

    const explicitlyAssigned = transaction.splitParts.reduce((sum, part) => sum + (part.amount ?? 0), 0);
    return transaction.amount - explicitlyAssigned;
  }

  private toBaseCurrency(amount: number, currencyRate: number | null | undefined): number {
    return amount * (currencyRate ?? 1);
  }

  private roundMoney(amount: number): number {
    return roundToPrecision(amount, 2);
  }

  async getBasic(reckoningId: number, userId: number): Promise<GetBasicSummaryResponseDto> {
    const transactionsIncludedInAsPayer = await this.transactionRepo.find({
      where: { reckoning: { id: reckoningId }, payers: { userId } },
      relations: ['payers'],
    });

    let totalFromPaidTransactions = 0;
    for (const transaction of transactionsIncludedInAsPayer) {
      totalFromPaidTransactions += this.toBaseCurrency(
        this.getPayerAmount(transaction, userId),
        transaction.currencyRate,
      );
    }

    const transactionIdsWhereUserIsIncluded = await this.transactionRepo
      .createQueryBuilder('t')
      .innerJoin('t.splitParts', 'sp')
      .innerJoin('sp.includees', 'i')
      .where('t.reckoningId = :reckoningId', { reckoningId })
      .andWhere('i.userId = :userId', { userId })
      .select('t.id', 'id')
      .distinct(true)
      .getRawMany<{ id: number }>();

    const transactionsIncludedInAsIncludee = transactionIdsWhereUserIsIncluded.length
      ? await this.transactionRepo.find({
          where: { id: In(transactionIdsWhereUserIsIncluded.map(t => t.id)) },
          relations: ['splitParts', 'splitParts.includees'],
        })
      : [];

    let totalFromSplitParts = 0;
    for (const transaction of transactionsIncludedInAsIncludee) {
      for (const splitPart of transaction.splitParts) {
        if (!splitPart.includees.some(includee => includee.userId === userId)) continue;

        totalFromSplitParts += this.toBaseCurrency(
          this.getSplitPartAmount(transaction, splitPart) / splitPart.includees.length,
          transaction.currencyRate,
        );
      }
    }

    const returnsGivenForUser = await this.returnRepo.find({
      where: { reckoning: { id: reckoningId }, returnedByUserId: userId },
    });
    const returnsReceivedForUser = await this.returnRepo.find({
      where: { reckoning: { id: reckoningId }, returnedToUserId: userId },
    });

    const totalReturnsGiven = returnsGivenForUser.reduce(
      (sum, rtn) => sum + this.toBaseCurrency(rtn.amount ?? 0, rtn.currencyRate),
      0,
    );
    const totalReturnsReceived = returnsReceivedForUser.reduce(
      (sum, rtn) => sum + this.toBaseCurrency(rtn.amount ?? 0, rtn.currencyRate),
      0,
    );

    return {
      numberOfPaidTransactions: transactionsIncludedInAsPayer.length,
      totalFromPaidTransactions: this.roundMoney(totalFromPaidTransactions),
      numberOfSplitPartTransactions: transactionsIncludedInAsIncludee.length,
      totalFromSplitParts: this.roundMoney(totalFromSplitParts),
      numberOfReturnsGiven: returnsGivenForUser.length,
      totalReturnsGiven: this.roundMoney(totalReturnsGiven),
      numberOfReturnsReceived: returnsReceivedForUser.length,
      totalReturnsReceived: this.roundMoney(totalReturnsReceived),
    };
  }

  async getDetailed(reckoningId: number): Promise<GetDetailedSummaryResponseDto> {
    const transactions = await this.transactionRepo.find({
      where: { reckoning: { id: reckoningId } },
      relations: ['payers', 'splitParts', 'splitParts.includees'],
    });
    const returns = await this.returnRepo.find({
      where: { reckoning: { id: reckoningId } },
    });
    const reckoningUsers = await this.reckoningUserRepo.find({
      where: { reckoning: { id: reckoningId } },
      relations: ['user'],
    });

    const userIdToUserNameMap = new Map<number, string>();
    for (const reckoningUser of reckoningUsers) {
      userIdToUserNameMap.set(reckoningUser.userId, reckoningUser.pseudonym ?? reckoningUser.user.displayName);
    }

    let totalFromTransactions = 0;
    for (const transaction of transactions) {
      totalFromTransactions += this.toBaseCurrency(transaction.amount, transaction.currencyRate);
    }

    let totalFromReturns = 0;
    for (const rtn of returns) {
      totalFromReturns += this.toBaseCurrency(rtn.amount ?? 0, rtn.currencyRate);
    }

    const userSummaries = new Map<number, PersonalSummaryDto>();
    const getUserSummary = (userId: number): PersonalSummaryDto => {
      let summary = userSummaries.get(userId);
      if (!summary) {
        summary = {
          numberOfPaidTransactions: 0,
          totalFromPaidTransactions: 0,
          numberOfSplitPartTransactions: 0,
          totalFromSplitParts: 0,
          numberOfReturnsGiven: 0,
          totalReturnsGiven: 0,
          numberOfReturnsReceived: 0,
          totalReturnsReceived: 0,
          userId,
          user: undefined as any,
        };
        userSummaries.set(userId, summary);
      }
      return summary;
    };

    for (const transaction of transactions) {
      for (const payer of transaction.payers) {
        const summary = getUserSummary(payer.userId);
        summary.numberOfPaidTransactions += 1;
        summary.totalFromPaidTransactions += this.toBaseCurrency(
          this.getPayerAmount(transaction, payer.userId),
          transaction.currencyRate,
        );
      }

      const foundUserIds = new Set<number>();
      for (const splitPart of transaction.splitParts) {
        const amountPerIncludee = this.getSplitPartAmount(transaction, splitPart) / splitPart.includees.length;
        const baseAmountPerIncludee = this.toBaseCurrency(amountPerIncludee, transaction.currencyRate);

        for (const includee of splitPart.includees) {
          const summary = getUserSummary(includee.userId);
          if (!foundUserIds.has(includee.userId)) {
            foundUserIds.add(includee.userId);
            summary.numberOfSplitPartTransactions += 1;
          }
          summary.totalFromSplitParts += baseAmountPerIncludee;
        }
      }
    }

    for (const rtn of returns) {
      const baseAmount = this.toBaseCurrency(rtn.amount ?? 0, rtn.currencyRate);

      const summaryGiven = getUserSummary(rtn.returnedByUserId);
      summaryGiven.numberOfReturnsGiven += 1;
      summaryGiven.totalReturnsGiven += baseAmount;

      const summaryReceived = getUserSummary(rtn.returnedToUserId);
      summaryReceived.numberOfReturnsReceived += 1;
      summaryReceived.totalReturnsReceived += baseAmount;
    }

    const personalSummaries = Array.from(userSummaries.values());
    for (const summary of personalSummaries) {
      summary.totalFromPaidTransactions = this.roundMoney(summary.totalFromPaidTransactions);
      summary.totalFromSplitParts = this.roundMoney(summary.totalFromSplitParts);
      summary.totalReturnsGiven = this.roundMoney(summary.totalReturnsGiven);
      summary.totalReturnsReceived = this.roundMoney(summary.totalReturnsReceived);
    }

    personalSummaries.sort((a, b) => {
      const nameA = userIdToUserNameMap.get(a.userId) ?? '';
      const nameB = userIdToUserNameMap.get(b.userId) ?? '';
      return nameA.localeCompare(nameB);
    });

    return {
      numberOfTransactions: transactions.length,
      totalFromTransactions: this.roundMoney(totalFromTransactions),
      numberOfReturns: returns.length,
      totalFromReturns: this.roundMoney(totalFromReturns),
      reckoningBalance: this.roundMoney(-totalFromTransactions + totalFromReturns),
      numberOfUsers: userSummaries.size,
      personalSummaries,
    };
  }
}
