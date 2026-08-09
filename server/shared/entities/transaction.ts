import { CurrencyCode } from '../enums/currency-code';
import { ITransactionSplitPart } from './transaction-includee';
import { ITransactionPayer } from './transaction-payer';
import { IUser } from './user';

export interface ITransactionBasicData {
  name: string;
  amount: number;
  currencyCode: CurrencyCode;
  currencyRate: number | null;
  isCurrencyRateFromApi: boolean | null;
  transactionDate: Date;
}

export interface ITransaction extends ITransactionBasicData {
  id: number;
  createdByUserId: number;
  createdBy: IUser;
  createdDate: Date;
  updatedByUserId: number;
  updatedBy: IUser;
  updatedDate: Date;
  payers: ITransactionPayer[];
  splitParts: ITransactionSplitPart[];
}
