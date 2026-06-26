import { IGetBasicSummaryResponse } from '@shared/contracts/summary/get-basic';

export class GetBasicSummaryResponseDto implements IGetBasicSummaryResponse {
  numberOfPaidTransactions: number;
  totalFromPaidTransactions: number;
  numberOfSplitPartTransactions: number;
  totalFromSplitParts: number;
  numberOfPayments: number;
  totalFromPayments: number;
}
