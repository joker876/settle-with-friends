import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { roundToPrecision } from 'more-rounding';
import { In, Repository } from 'typeorm';
import { Payment } from '../typeorm/entities';
import { Transaction } from './../typeorm/entities/Transaction';
import { GetBasicSummaryResponseDto } from './dtos/get-basic';
import { GetDetailedSummaryResponseDto, PersonalSummaryDto } from './dtos/get-detailed';

@Injectable()
export class SummaryService {
  constructor(
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Transaction) private readonly transactionRepo: Repository<Transaction>,
  ) {}

  async getBasic(reckoningId: number, userId: number): Promise<GetBasicSummaryResponseDto> {
    const transactionsIncludedInAsPayer = await this.transactionRepo.find({
      where: {
        reckoning: { id: reckoningId },
        payers: {
          userId: userId,
        },
      },
      relations: ['payers'],
    });

    let numberOfPaidTransactions = 0;
    let totalFromPaidTransactions = 0;

    for (const transaction of transactionsIncludedInAsPayer) {
      const userPayer = transaction.payers.find(payer => payer.userId === userId)!;

      numberOfPaidTransactions += 1;

      if (userPayer.amount !== null) {
        totalFromPaidTransactions += roundToPrecision(userPayer.amount * (transaction.currencyRate ?? 1), 2);
        continue;
      }

      const amountFromOtherPayers = transaction.payers
        .filter(payer => payer.userId !== userId)
        .reduce((sum, payer) => sum + (payer.amount ?? 0), 0);

      totalFromPaidTransactions += roundToPrecision(
        ((transaction.amount ?? 0) - amountFromOtherPayers) * (transaction.currencyRate ?? 1),
        2,
      );
    }

    const transactionIdsWhereUserIsIncluded = (await this.transactionRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.splitParts', 'sp')
      .leftJoinAndSelect('sp.includees', 'i')
      .where('t.reckoningId = :reckoningId', { reckoningId })
      .andWhere('i.userId = :userId', { userId })
      .select(['t.id'])
      .getMany()) as { id: number }[];

    const transactionsIncludedInAsIncludee = await this.transactionRepo.find({
      where: {
        id: In(transactionIdsWhereUserIsIncluded.map(t => t.id)),
      },
      relations: ['splitParts', 'splitParts.includees'],
    });

    let numberOfSplitPartTransactions = 0;
    let totalFromSplitParts = 0;

    for (const transaction of transactionsIncludedInAsIncludee) {
      let totalAmountInThisTransaction = 0;

      const totalFromNonNullAmountSplitParts = roundToPrecision(
        transaction.splitParts
          .filter(splitPart => splitPart.amount !== null)
          .reduce((sum, splitPart) => sum + splitPart.amount!, 0),
        2,
      );

      for (const splitPart of transaction.splitParts) {
        const userIncludee = splitPart.includees.find(includee => includee.userId === userId);
        if (!userIncludee) continue;

        if (splitPart.amount !== null) {
          totalAmountInThisTransaction += roundToPrecision(splitPart.amount / splitPart.includees.length, 2);
          continue;
        }
        totalAmountInThisTransaction += roundToPrecision(
          (transaction.amount - totalFromNonNullAmountSplitParts) / splitPart.includees.length,
          2,
        );
      }
      numberOfSplitPartTransactions += 1;
      totalFromSplitParts += roundToPrecision(totalAmountInThisTransaction * (transaction.currencyRate ?? 1), 2);
    }

    const paymentsForUser = await this.paymentRepo.find({
      where: {
        reckoning: { id: reckoningId },
        paidByUserId: userId,
      },
    });

    const numberOfPayments = paymentsForUser.length;
    const totalFromPayments = roundToPrecision(
      paymentsForUser.reduce((sum, payment) => sum + (payment.amount ?? 0) * (payment.currencyRate ?? 1), 0),
      2,
    );

    return {
      numberOfPaidTransactions,
      totalFromPaidTransactions,
      numberOfSplitPartTransactions,
      totalFromSplitParts,
      numberOfPayments,
      totalFromPayments,
    } as any;
  }

  async getDetailed(reckoningId: number): Promise<GetDetailedSummaryResponseDto> {
    const transactions = await this.transactionRepo.find({
      where: { reckoning: { id: reckoningId } },
      relations: ['payers', 'splitParts', 'splitParts.includees'],
    });
    const payments = await this.paymentRepo.find({
      where: { reckoning: { id: reckoningId } },
    });

    const numberOfTransactions = transactions.length;
    const totalFromTransactions = roundToPrecision(
      transactions.reduce((sum, transaction) => sum + (transaction.amount ?? 0) * (transaction.currencyRate ?? 1), 0),
      2,
    );

    const numberOfPayments = payments.length;
    const totalFromPayments = roundToPrecision(
      payments.reduce((sum, payment) => sum + (payment.amount ?? 0) * (payment.currencyRate ?? 1), 0),
      2,
    );

    const userSummaries = new Map<number, PersonalSummaryDto>();

    const getUserSummary = (userId: number): PersonalSummaryDto => {
      if (!userSummaries.has(userId)) {
        userSummaries.set(userId, {
          numberOfPaidTransactions: 0,
          totalFromPaidTransactions: 0,
          numberOfSplitPartTransactions: 0,
          totalFromSplitParts: 0,
          numberOfPayments: 0,
          totalFromPayments: 0,
          userId: userId,
          user: undefined as any,
        });
      }
      return userSummaries.get(userId)!;
    };

    for (const transaction of transactions) {
      // payers
      const amountFromNonNullPayers = roundToPrecision(
        transaction.payers.filter(payer => payer.amount !== null).reduce((sum, payer) => sum + (payer.amount ?? 0), 0),
        2,
      );
      for (const payer of transaction.payers) {
        const summary = getUserSummary(payer.userId);
        summary.numberOfPaidTransactions += 1;

        if (payer.amount !== null) {
          summary.totalFromPaidTransactions += roundToPrecision(payer.amount * (transaction.currencyRate ?? 1), 2);
          continue;
        }

        summary.totalFromPaidTransactions += roundToPrecision(
          (transaction.amount! - amountFromNonNullPayers) * (transaction.currencyRate ?? 1),
          2,
        );
      }
      // includees
      const amountFromNonNullSplitParts = roundToPrecision(
        transaction.splitParts
          .filter(splitPart => splitPart.amount !== null)
          .reduce((sum, splitPart) => sum + (splitPart.amount ?? 0), 0),
        2,
      );

      const foundUserIds = new Set<number>();
      for (const splitPart of transaction.splitParts) {
        const amountPerIncludee =
          splitPart.amount !== null
            ? splitPart.amount / splitPart.includees.length
            : (transaction.amount! - amountFromNonNullSplitParts) / splitPart.includees.length;

        for (const includee of splitPart.includees) {
          const summary = getUserSummary(includee.userId);
          // only count the transaction once per user, even if they are included multiple times
          if (!foundUserIds.has(includee.userId)) {
            foundUserIds.add(includee.userId);
            summary.numberOfSplitPartTransactions += 1;
          }
          summary.totalFromSplitParts += roundToPrecision(amountPerIncludee * (transaction.currencyRate ?? 1), 2);
        }
      }
    }

    for (const payment of payments) {
      const summary = getUserSummary(payment.paidByUserId);
      summary.numberOfPayments += 1;
      summary.totalFromPayments += roundToPrecision(payment.amount * (payment.currencyRate ?? 1), 2);
    }

    return {
      numberOfTransactions,
      totalFromTransactions,
      numberOfPayments,
      totalFromPayments,
      numberOfUsers: userSummaries.size,
      personalSummaries: Array.from(userSummaries.values()),
    };
  }
}
