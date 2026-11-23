import { IUpdateReckoningRequestDto } from '@shared/contracts/reckonings/update';
import { CurrencyCode } from '@shared/enums/currency-code';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TrimString } from '../../../utils/trim-string.transform';

export class UpdateReckoningRequestDto implements IUpdateReckoningRequestDto {
  @IsString()
  @IsNotEmpty()
  @TrimString()
  name: string;

  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @IsEnum(CurrencyCode, { each: true })
  helperCurrencies: CurrencyCode[];
}
