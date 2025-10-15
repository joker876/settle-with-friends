import { IReckoning } from '../../entities/reckoning';

export interface ICreateReckoningRequestDto extends Pick<IReckoning, 'name'> {}
