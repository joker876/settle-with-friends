import { SelectableOption } from '@common/utils/options';

export enum AmountType {
  Amount = 'amount',
  Remaining = 'remaining',
}

export const amountTypeOptions: SelectableOption<AmountType>[] = [
  // labels are handled by amountTypeLabelMap
  { label: '', value: AmountType.Amount },
  { label: '', value: AmountType.Remaining },
];

export function createAmountTypeLabelMap(showEverything: boolean) {
  return {
    [AmountType.Amount]: $localize`:@@common.amount-ellipsis:Kwota...`,
    [AmountType.Remaining]: showEverything
      ? $localize`:@@common.everything-titlecase:Całość`
      : $localize`:@@common.remaining-titlecase:Reszta`,
  };
}
