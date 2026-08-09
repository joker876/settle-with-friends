import { CurrencyCode } from '../enums/currency-code';

export interface IReckoning {
  id: number;
  name: string;
  createdDate: Date;
  updatedDate: Date;
  mainCurrency: CurrencyCode;
  helperCurrencies: CurrencyCode[];
  archivedAt: Date | null;
}
