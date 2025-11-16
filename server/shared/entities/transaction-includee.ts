import { ITransaction } from './transaction';
import { IUser } from './user';

export interface ITransactionIncludee {
  id: number;
  userId: number;
  user: IUser;
  isEqualSplit: boolean;
  amount: number;
}

export interface ITransactionIncludeeInternal extends ITransactionIncludee {
  transactionId: number;
  transaction: ITransaction;
}
