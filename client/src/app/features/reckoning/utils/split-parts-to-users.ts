import { ITransactionSplitPart } from '@shared/entities/transaction-includee';
import { ITransactionPayer } from '@shared/entities/transaction-payer';
import { IUser } from '@shared/entities/user';

export interface IUserBalanceData {
  user: IUser;
  totalAmount: number;
  isRemaining: boolean | null;
}

export function transactionSplitPartsToUserIncludeeData(
  transxAmount: number,
  parts: ITransactionSplitPart[],
): IUserBalanceData[] {
  const users: Record<number, IUserBalanceData> = {};

  const sortedParts = [...parts].sort((a, b) => b.amount || -1);

  for (const part of sortedParts) {
    const amount = part.amount || transxAmount;
    const amountPerPerson = amount / part.includees.length;
    transxAmount -= amount;

    for (const includee of part.includees) {
      if (!users[includee.userId]) {
        users[includee.userId] = {
          user: includee.user,
          totalAmount: 0,
          isRemaining: null,
        };
      }
      const userData = users[includee.userId]!;
      userData.totalAmount += amountPerPerson;
    }
  }
  return Object.values(users);
}

export function transactionPayersToUserIncludeeData(
  transxAmount: number,
  payers: ITransactionPayer[],
): IUserBalanceData[] {
  const users: Record<number, IUserBalanceData> = {};

  const sortedPayers = [...payers].sort((a, b) => b.amount || -1);

  for (const payer of sortedPayers) {
    const amount = payer.amount || transxAmount;
    transxAmount -= amount;

    users[payer.userId] = {
      user: payer.user,
      totalAmount: amount,
      isRemaining: payer.amount === null,
    };
  }
  return Object.values(users);
}
