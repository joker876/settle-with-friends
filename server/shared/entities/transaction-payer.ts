import { ITransaction } from './transaction';
import { IUser } from './user';

export interface ITransactionPayer {
  id: number;
  userId: number;
  user: IUser;
  amount: number;
}

export interface ITransactionPayerInternal extends ITransactionPayer {
  transactionId: number;
  transaction: ITransaction;
}
