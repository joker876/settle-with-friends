import { IGetDetailedSummaryResponse, IPersonalSummary } from '@shared/contracts/summary/get-detailed';
import { IUser } from '@shared/entities/user';
import { GetBasicSummaryResponseDto } from './get-basic';

export class GetDetailedSummaryResponseDto implements IGetDetailedSummaryResponse {
  numberOfTransactions: number;
  totalFromTransactions: number;
  numberOfReturns: number;
  totalFromReturns: number;
  numberOfUsers: number;

  personalSummaries: PersonalSummaryDto[];
}

export class PersonalSummaryDto extends GetBasicSummaryResponseDto implements IPersonalSummary {
  userId: number;
  user: IUser;
}
