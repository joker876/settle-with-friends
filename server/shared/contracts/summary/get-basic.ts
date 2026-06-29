export interface IGetBasicSummaryResponse {
  numberOfPaidTransactions: number;
  totalFromPaidTransactions: number;
  numberOfSplitPartTransactions: number;
  totalFromSplitParts: number;
  numberOfReturnsGiven: number;
  totalReturnsGiven: number;
  numberOfReturnsReceived: number;
  totalReturnsReceived: number;
}