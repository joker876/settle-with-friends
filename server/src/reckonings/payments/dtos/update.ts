import { IPaymentBasicData } from '@shared/entities/payment';
import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { TrimString } from '../../../utils/trim-string.transform';

export class UpdatePaymentRequestDto implements IPaymentBasicData {
  @IsString()
  @IsNotEmpty()
  @TrimString()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  paidByUserId: number;

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
  paymentDate: Date;
}
