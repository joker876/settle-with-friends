import { isSumMatchingTransactionAmount } from '../src/utils/transaction-sum-checker';

describe('isSumMatchingTransactionAmount', () => {
  it('returns true and the sum when the known part amounts equal the transaction amount', () => {
    expect(isSumMatchingTransactionAmount(100, [40, 35, 25])).toEqual([true, 100]);
  });

  it('returns false and the sum when the known part amounts exceed the transaction amount', () => {
    expect(isSumMatchingTransactionAmount(100, [60, 50])).toEqual([false, 110]);
  });

  it('returns false and the sum when the known part amounts are less than the transaction amount', () => {
    expect(isSumMatchingTransactionAmount(100, [40, 50])).toEqual([false, 90]);
  });

  it('returns true and the sum when a null part allows the remaining amount to fill the difference', () => {
    expect(isSumMatchingTransactionAmount(100, [40, null, 20])).toEqual([true, 60]);
  });

  it('returns true and the sum when the known parts equal the transaction amount and another part is null', () => {
    expect(isSumMatchingTransactionAmount(100, [50, null, 50])).toEqual([true, 100]);
  });

  it('returns false and the sum when known parts exceed the transaction amount even with a null part', () => {
    expect(isSumMatchingTransactionAmount(100, [60, null, 50])).toEqual([false, 110]);
  });

  it('rounds the accumulated part sum before comparing it with the transaction amount', () => {
    expect(isSumMatchingTransactionAmount(0.3, [0.1, 0.2])).toEqual([true, 0.3]);
  });

  it('handles an empty part list', () => {
    expect(isSumMatchingTransactionAmount(0, [])).toEqual([true, 0]);
    expect(isSumMatchingTransactionAmount(10, [])).toEqual([false, 0]);
  });

  it('allows a zero transaction amount when a null part is present', () => {
    expect(isSumMatchingTransactionAmount(0, [null])).toEqual([true, 0]);
  });
});
