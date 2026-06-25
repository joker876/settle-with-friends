import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { roundToPrecision } from 'more-rounding';
import { In, Repository } from 'typeorm';
import { Payment } from '../typeorm/entities';
import { Transaction } from './../typeorm/entities/Transaction';
import { GetBasicSummaryResponseDto } from './dtos/get-basic';

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

      const amountFromOtherPayers = roundToPrecision(
        transaction.payers
          .filter(payer => payer.userId !== userId)
          .reduce((sum, payer) => sum + (payer.amount ?? 0) * (transaction.currencyRate ?? 1), 0),
        2,
      );

      totalFromPaidTransactions += roundToPrecision(
        (transaction.amount ?? 0) * (transaction.currencyRate ?? 1) - amountFromOtherPayers,
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

      console.log('transaction', JSON.stringify(transaction, null, 2));

      for (const splitPart of transaction.splitParts) {
        const userIncludee = splitPart.includees.find(includee => includee.userId === userId);
        if (!userIncludee) continue;

        if (splitPart.amount !== null) {
          totalAmountInThisTransaction += splitPart.amount / splitPart.includees.length;
          console.log(
            'totalAmountInThisTransaction',
            totalAmountInThisTransaction,
            'splitPart.id',
            splitPart.id,
            'splitPart.amount',
            splitPart.amount,
            'transaction.currencyRate',
            transaction.currencyRate,
            'splitPart.includees.length',
            splitPart.includees.length,
          );
          continue;
        }
        totalAmountInThisTransaction +=
          (transaction.amount - totalFromNonNullAmountSplitParts) / splitPart.includees.length;

        console.log(
          'totalAmountInThisTransaction',
          totalAmountInThisTransaction,
          'splitPart.id',
          splitPart.id,
          'transaction.amount',
          transaction.amount,
          'transaction.currencyRate',
          transaction.currencyRate,
          'splitPart.includees.length',
          splitPart.includees.length,
          'totalFromNonNullAmountSplitParts',
          totalFromNonNullAmountSplitParts,
        );
      }
      numberOfSplitPartTransactions += 1;
      totalFromSplitParts += roundToPrecision(totalAmountInThisTransaction * (transaction.currencyRate ?? 1), 2);
    }

    const paymentsAndTotalAmount: { numberOfPayments: string; totalFromPayments: number } = (await this.paymentRepo
      .createQueryBuilder('p')
      .where('p.reckoningId = :reckoningId', { reckoningId })
      .andWhere('p.paidByUserId = :userId', { userId })
      .select('COUNT(p.id)', 'numberOfPayments')
      .addSelect('SUM(p.amount)', 'totalFromPayments')
      .getRawOne())!;

    return {
      numberOfPaidTransactions,
      totalFromPaidTransactions,
      numberOfSplitPartTransactions,
      totalFromSplitParts,
      numberOfPayments: parseInt(paymentsAndTotalAmount.numberOfPayments, 10),
      totalFromPayments: roundToPrecision(paymentsAndTotalAmount.totalFromPayments, 2),
    } as any;
  }

  // async getDetailed(reckoningId: number): Promise<GetDetailedSummaryResponseDto> {
  //   const transactions = await this.transactionRepo.find({
  //     where: { reckoning: { id: reckoningId } },
  //     relations: ['payers', 'splitParts', 'splitParts.includees'],
  //   });
  //   const payments = await this.paymentRepo.find({
  //     where: { reckoning: { id: reckoningId } },
  //   });

  //   const userSummaries = new Map<number, PersonalSummaryDto>();

  //   for (const transaction of transactions) {
  //     for (const payer of transaction.payers) {
  //       if (!userSummaries.has(payer.userId)) {
  //         userSummaries.set(payer.userId, {
  //           numberOfPaidTransactions: 0,
  //           totalFromPaidTransactions: 0,
  //           numberOfSplitPartTransactions: 0,
  //           totalFromSplitParts: 0,
  //           numberOfPayments: 0,
  //           totalFromPayments: 0,
  //           userId: payer.userId,
  //           user: undefined as any,
  //         });
  //       }
  //       const summary = userSummaries.get(payer.userId)!;
  //       summary.numberOfPaidTransactions += 1;
  //       summary.totalFromPaidTransactions += payer.amount ?? transaction.amount;
  //     }
  //   }
  // }
}
