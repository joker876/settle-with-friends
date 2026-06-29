import { IReturnBasicData } from '@shared/entities/return';
import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { TrimString } from '../../../utils/trim-string.transform';

export class UpdateReturnRequestDto implements IReturnBasicData {
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
  currencyCode: string;

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
