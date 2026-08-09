import { CurrencyCode } from "../enums/currency-code";
import { IUser } from "./user";

export interface IReturnBasicData {
  name: string;
  returnedByUserId: number;
  returnedToUserId: number;
  amount: number;
  currencyCode: CurrencyCode;
  currencyRate: number | null;
  isCurrencyRateFromApi: boolean | null;
  returnDate: Date;
}

export interface IReturn extends IReturnBasicData {
  id: number;
  returnedBy: IUser;
  returnedByUserId: number;
  returnedTo: IUser;
  returnedToUserId: number;
  createdBy: IUser;
  createdByUserId: number;
  createdDate: Date;
  updatedBy: IUser;
  updatedByUserId: number;
  updatedDate: Date;
}