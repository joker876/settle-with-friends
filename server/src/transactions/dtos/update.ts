import {
    IUpdateTransactionRequestDto,
    IUpdateTransactionRequestPayerDto,
    IUpdateTransactionRequestSplitPartDto,
} from '@shared/contracts/transactions/update';
import { ITransactionBasicData } from '@shared/entities/transaction';
import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { TrimString } from '../../utils/trim-string.transform';
import { Nested, NestedArray } from '../../utils/validation.decorators';

export class UpdateTransactionBasicDataDto implements ITransactionBasicData {
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
  currencyCode: string;

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

export class UpdateTransactionRequestPayerDto implements IUpdateTransactionRequestPayerDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsOptional()
  amount: number | null;
}

export class UpdateTransactionRequestSplitPartDto implements IUpdateTransactionRequestSplitPartDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
  
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

export class UpdateTransactionRequestDto implements IUpdateTransactionRequestDto {
  @IsNotEmpty()
  @Nested(() => UpdateTransactionBasicDataDto)
  transaction: UpdateTransactionBasicDataDto;

  @IsNotEmpty()
  @NestedArray(() => UpdateTransactionRequestPayerDto)
  payers: UpdateTransactionRequestPayerDto[];

  @IsNotEmpty()
  @NestedArray(() => UpdateTransactionRequestSplitPartDto)
  splitParts: UpdateTransactionRequestSplitPartDto[];
}
