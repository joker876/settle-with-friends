import {
  ICreateTransactionRequestDto,
  ICreateTransactionRequestPayerDto,
  ICreateTransactionRequestSplitPartDto,
} from '@shared/contracts/transactions/create';
import { ITransactionBasicData } from '@shared/entities/transaction';
import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Nested, NestedArray } from '../../../utils/validation.decorators';

export class CreateTransactionBasicDataDto implements ITransactionBasicData {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  currencyCode: string;

  @IsNumber()
  currencyRate: number | null;

  @IsBoolean()
  isCurrencyRateFromApi: boolean | null;

  @IsNotEmpty()
  @IsDate()
  transactionDate: Date;
}

export class CreateTransactionRequestPayerDto implements ICreateTransactionRequestPayerDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}

export class CreateTransactionRequestSplitPartDto implements ICreateTransactionRequestSplitPartDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsNotEmpty({ each: true })
  @IsNumber({}, { each: true })
  includees: number[];
}

export class CreateTransactionRequestDto implements ICreateTransactionRequestDto {
  @IsNotEmpty()
  @Nested(() => CreateTransactionBasicDataDto)
  transaction: CreateTransactionBasicDataDto;

  @NestedArray(() => CreateTransactionRequestPayerDto)
  payers: CreateTransactionRequestPayerDto[];

  @NestedArray(() => CreateTransactionRequestSplitPartDto)
  splitParts: CreateTransactionRequestSplitPartDto[];
}
