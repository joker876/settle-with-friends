import { IUser } from './user';

export interface ITransaction {
  id: number;
  name: string;
  amount: number;
  currencyCode: string;
  currencyRate?: number;
  isCurrencyRateFromApi?: boolean;
  transactionDate: Date;
  createdBy: IUser;
  createdDate: Date;
  updatedBy: IUser;
  updatedDate: Date;
  payers: ITransactionUser[];
  includees: ITransactionUser[];
}

export interface ITransactionUser {
  user: IUser;
  amount: number;
}
