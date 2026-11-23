import { ICreateReckoningRequestDto } from './create';

export interface IUpdateReckoningRequestDto extends Omit<ICreateReckoningRequestDto, 'mainCurrency'> {}
