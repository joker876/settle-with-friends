export interface IGetBasicSummaryResponse {
  numberOfPaidTransactions: number;
  totalFromPaidTransactions: number;
  numberOfSplitPartTransactions: number;
  totalFromSplitParts: number;
  numberOfPayments: number;
  totalFromPayments: number;
}