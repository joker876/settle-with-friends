export interface IReckoning {
  id: number;
  name: string;
  createdDate: Date;
  updatedDate: Date;
  mainCurrency: string;
  helperCurrency: string | null;
  isArchived: boolean;
}