import { ITransaction } from './transaction';
import { IUser } from './user';

export interface ITransactionSplitPart {
  id: number;
  name: string;
  amount: number | null;
  includees: ITransactionSplitPartIncludee[];
}

export interface ITransactionSplitPartInternal extends ITransactionSplitPart {
  transactionId: number;
  transaction: ITransaction;
}

export interface ITransactionSplitPartIncludee {
  id: number;
  userId: number;
  user: IUser;
}