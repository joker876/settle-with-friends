import { IReckoning } from '../../entities/reckoning';

export interface IReckoningTableData extends IReckoning {
  numberOfUsers: number;
  currentBalance: number;
  numberOfTransactions: number;
}

export type GetAllReckoningsResponseDto = IReckoningTableData[];
