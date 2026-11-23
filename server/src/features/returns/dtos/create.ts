import { IReturnBasicData } from '@shared/entities/return';
import { CurrencyCode } from '@shared/enums/currency-code';
import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
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
  returnDate: Date;
}
