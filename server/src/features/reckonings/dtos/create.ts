import { ICreateReckoningRequestDto } from '@shared/contracts/reckonings/create';
import { IsNotEmpty, IsString } from 'class-validator';
import { TrimString } from '../../../utils/trim-string.transform';

export class CreateReckoningRequestDto implements ICreateReckoningRequestDto {
  @IsString()
  @IsNotEmpty()
  @TrimString()
  name: string;
}
