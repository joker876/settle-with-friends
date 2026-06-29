import { IGetBasicSummaryResponse } from '@shared/contracts/summary/get-basic';

export class GetBasicSummaryResponseDto implements IGetBasicSummaryResponse {
  numberOfPaidTransactions: number;
  totalFromPaidTransactions: number;
  numberOfSplitPartTransactions: number;
  totalFromSplitParts: number;
  numberOfReturnsGiven: number;
  totalReturnsGiven: number;
  numberOfReturnsReceived: number;
  totalReturnsReceived: number;
}
