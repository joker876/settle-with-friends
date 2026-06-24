import { ITransactionBasicData } from './../../entities/transaction';
import { ITransactionSplitPart } from './../../entities/transaction-includee';
import { ITransactionPayer } from './../../entities/transaction-payer';

export interface IUpdateTransactionRequestDto {
  transaction: ITransactionBasicData;
  payers: IUpdateTransactionRequestPayerDto[];
  splitParts: IUpdateTransactionRequestSplitPartDto[];
}

export interface IUpdateTransactionRequestPayerDto extends Omit<ITransactionPayer, 'user'> {}

export interface IUpdateTransactionRequestSplitPartDto extends Omit<ITransactionSplitPart, 'includees'> {
  includees: number[];
}
