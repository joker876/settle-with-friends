import { ITransactionBasicData } from './../../entities/transaction';
import { ITransactionSplitPart } from './../../entities/transaction-includee';
import { ITransactionPayer } from './../../entities/transaction-payer';

export interface ICreateTransactionRequestDto {
  transaction: ITransactionBasicData;
  payers: ICreateTransactionRequestPayerDto[];
  splitParts: ICreateTransactionRequestSplitPartDto[];
}

export interface ICreateTransactionRequestPayerDto extends Omit<ITransactionPayer, 'id' | 'user'> {}

export interface ICreateTransactionRequestSplitPartDto extends Omit<ITransactionSplitPart, 'id' | 'includees'> {
  includees: number[];
}
