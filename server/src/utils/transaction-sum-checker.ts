import { roundToPrecision } from 'more-rounding';

export function isSumMatchingTransactionAmount(transactionAmount: number, partAmounts: (number | null)[]): [boolean, number] {
  const hasNull = partAmounts.some(amount => amount === null);
  const sum = partAmounts.reduce<number>((acc, amount) => acc + (amount ?? 0), 0);
  const roundedSum = roundToPrecision(sum, 2);
  return [!(roundedSum > transactionAmount || (roundedSum < transactionAmount && !hasNull)), roundedSum];
}
