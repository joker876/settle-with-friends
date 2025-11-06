import { IUser } from "./user";

export interface IPayment {
  id: number;
  name: string;
  paidBy: IUser;
  amount: number;
  currencyCode: string;
  currencyRate?: number;
  isCurrencyRateFromApi?: boolean;
  paymentDate: Date;
  createdBy: IUser;
  createdDate: Date;
  updatedBy: IUser;
  updatedDate: Date;
}