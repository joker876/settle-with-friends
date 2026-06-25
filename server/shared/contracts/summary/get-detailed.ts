import { IUser } from '../../entities/user';
import { IGetBasicSummaryResponse } from './get-basic';

export interface IGetDetailedSummaryResponse {
  numberOfTransactions: number;
  totalFromTransactions: number;
  numberOfPayments: number;
  totalFromPayments: number;
  numberOfUsers: number;

  personalSummaries: IPersonalSummary[];
}

export interface IPersonalSummary extends IGetBasicSummaryResponse {
  userId: number;
  user: IUser;
}
