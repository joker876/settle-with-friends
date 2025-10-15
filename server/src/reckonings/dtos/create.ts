import { ICreateReckoningRequestDto } from '@shared/contracts/reckonings/create';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReckoningRequestDto implements ICreateReckoningRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
