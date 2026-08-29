import { IReturnBasicData } from '@shared/entities/return';
import { CurrencyCode } from '@shared/enums/currency-code';
import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { TrimString } from '../../../utils/trim-string.transform';

export class CreateReturnRequestDto implements IReturnBasicData {
  @IsString()
  @IsNotEmpty()
  @TrimString()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  returnedByUserId: number;

  @IsNumber()
  @IsNotEmpty()
  returnedToUserId: number;

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
  returnDate: Date;
}
