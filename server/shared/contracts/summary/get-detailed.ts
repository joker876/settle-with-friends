import { IUser } from '../../entities/user';
import { IGetBasicSummaryResponse } from './get-basic';

export interface IGetDetailedSummaryResponse {
  numberOfTransactions: number;
  totalFromTransactions: number;
  numberOfReturns: number;
  totalFromReturns: number;
  numberOfUsers: number;

  personalSummaries: IPersonalSummary[];
}

export interface IPersonalSummary extends IGetBasicSummaryResponse {
  userId: number;
  user: IUser;
}
