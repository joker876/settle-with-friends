import {
  ICreateTransactionRequestDto,
  ICreateTransactionRequestPayerDto,
  ICreateTransactionRequestSplitPartDto,
} from '@shared/contracts/transactions/create';
import { ITransactionBasicData } from '@shared/entities/transaction';
import { CurrencyCode } from '@shared/enums/currency-code';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { TrimString } from '../../../utils/trim-string.transform';
import { Nested, NestedArray } from '../../../utils/validation.decorators';

export class CreateTransactionBasicDataDto implements ITransactionBasicData {
  @IsString()
  @IsNotEmpty()
  @TrimString()
  name: string;

  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  @TrimString()
  @IsEnum(CurrencyCode)
  currencyCode: CurrencyCode;

  @IsNumber()
  @Min(0.0001)
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
  @Min(0.01)
  @IsOptional()
  amount: number | null;
}

export class CreateTransactionRequestSplitPartDto implements ICreateTransactionRequestSplitPartDto {
  @IsString()
  @IsNotEmpty()
  @TrimString()
  name: string;

  @IsNumber()
  @Min(0.01)
  @IsOptional()
  amount: number | null;

  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  includees: number[];
}

export class CreateTransactionRequestDto implements ICreateTransactionRequestDto {
  @IsNotEmpty()
  @Nested(() => CreateTransactionBasicDataDto)
  transaction: CreateTransactionBasicDataDto;

  @IsArray()
  @ArrayMinSize(1)
  @NestedArray(() => CreateTransactionRequestPayerDto)
  payers: CreateTransactionRequestPayerDto[];

  @IsArray()
  @ArrayMinSize(1)
  @NestedArray(() => CreateTransactionRequestSplitPartDto)
  splitParts: CreateTransactionRequestSplitPartDto[];
}
