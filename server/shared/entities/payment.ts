import { IUser } from "./user";

export interface IPaymentBasicData {
  name: string;
  paidByUserId: number;
  amount: number;
  currencyCode: string;
  currencyRate: number | null;
  isCurrencyRateFromApi: boolean | null;
  paymentDate: Date;
}

export interface IPayment extends IPaymentBasicData {
  id: number;
  paidBy: IUser;
  paidByUserId: number;
  createdBy: IUser;
  createdByUserId: number;
  createdDate: Date;
  updatedBy: IUser;
  updatedByUserId: number;
  updatedDate: Date;
}