import { ICreateReckoningRequestDto } from '@shared/contracts/reckonings/create';
import { CurrencyCode } from '@shared/enums/currency-code';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TrimString } from '../../../utils/trim-string.transform';

export class CreateReckoningRequestDto implements ICreateReckoningRequestDto {
  @IsString()
  @IsNotEmpty()
  @TrimString()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(CurrencyCode)
  mainCurrency: CurrencyCode;

  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @IsEnum(CurrencyCode, { each: true })
  helperCurrencies: CurrencyCode[];
}
