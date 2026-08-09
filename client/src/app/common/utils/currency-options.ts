import { CurrencyCode } from '@shared/enums/currency-code';
import { SelectableOption } from './options';

export const CURRENCY_OPTIONS: SelectableOption<CurrencyCode>[] = [
  { label: $localize`:@@common.currency.PLN:Polski Złoty (PLN)`, value: CurrencyCode.PolishZloty },
  { label: $localize`:@@common.currency.USD:Dolar amerykański (USD)`, value: CurrencyCode.UsDollar },
  { label: $localize`:@@common.currency.EUR:Euro (EUR)`, value: CurrencyCode.Euro },
  { label: $localize`:@@common.currency.GBP:Funt szterling (GBP)`, value: CurrencyCode.BritishPound },
  { label: $localize`:@@common.currency.AUD:Dolar australijski (AUD)`, value: CurrencyCode.AustralianDollar },
  { label: $localize`:@@common.currency.CAD:Dolar kanadyjski (CAD)`, value: CurrencyCode.CanadianDollar },
  { label: $localize`:@@common.currency.HUF:Forint węgierski (HUF)`, value: CurrencyCode.HungarianForint },
  { label: $localize`:@@common.currency.CHF:Frank szwajcarski (CHF)`, value: CurrencyCode.SwissFranc },
  { label: $localize`:@@common.currency.JPY:Jen japoński (JPY)`, value: CurrencyCode.JapaneseYen },
  { label: $localize`:@@common.currency.CZK:Korona czeska (CZK)`, value: CurrencyCode.CzechKoruna },
  { label: $localize`:@@common.currency.DKK:Korona duńska (DKK)`, value: CurrencyCode.DanishKrone },
  { label: $localize`:@@common.currency.NOK:Korona norweska (NOK)`, value: CurrencyCode.NorwegianKrone },
  { label: $localize`:@@common.currency.SEK:Korona szwedzka (SEK)`, value: CurrencyCode.SwedishKrona },
].map(v => ({ ...v, selectedLabel: v.value }));
