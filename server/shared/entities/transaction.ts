import { IUser } from './user';

export interface ITransaction {
  id: number;
  name: string;
  amount: number;
  currencyCode: string;
  currencyRate?: number;
  isCurrencyRateFromApi?: boolean;
  transactionDate: Date;
  createdByUserId: number;
  createdBy: IUser;
  createdDate: Date;
  updatedByUserId: number;
  updatedBy: IUser;
  updatedDate: Date;
  payers: ITransactionUser[];
  includees: ITransactionUser[];
}

export interface ITransactionUser {
  userId: number;
  user: IUser;
  amount: number;
}
