import {
  ICreateTransactionRequestDto,
  ICreateTransactionRequestPayerDto,
  ICreateTransactionRequestSplitPartDto,
} from '@shared/contracts/transactions/create';
import { ITransactionBasicData } from '@shared/entities/transaction';
import { CurrencyCode } from '@shared/enums/currency-code';
import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { TrimString } from '../../../utils/trim-string.transform';
import { Nested, NestedArray } from '../../../utils/validation.decorators';

export class CreateTransactionBasicDataDto implements ITransactionBasicData {
  @IsString()
  @IsNotEmpty()
  @TrimString()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  @TrimString()
  @IsEnum(CurrencyCode)
  currencyCode: CurrencyCode;

  @IsNumber()
  @IsOptional()
  currencyRate: number | null;

  @IsBoolean()
  @IsOptional()
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
  @IsOptional()
  amount: number | null;
}

export class CreateTransactionRequestSplitPartDto implements ICreateTransactionRequestSplitPartDto {
  @IsString()
  @IsNotEmpty()
  @TrimString()
  name: string;

  @IsNumber()
  @IsOptional()
  amount: number | null;

  @IsNotEmpty({ each: true })
  @IsNumber({}, { each: true })
  includees: number[];
}

export class CreateTransactionRequestDto implements ICreateTransactionRequestDto {
  @IsNotEmpty()
  @Nested(() => CreateTransactionBasicDataDto)
  transaction: CreateTransactionBasicDataDto;

  @IsNotEmpty()
  @NestedArray(() => CreateTransactionRequestPayerDto)
  payers: CreateTransactionRequestPayerDto[];

  @IsNotEmpty()
  @NestedArray(() => CreateTransactionRequestSplitPartDto)
  splitParts: CreateTransactionRequestSplitPartDto[];
}
