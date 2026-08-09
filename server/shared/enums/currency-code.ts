export const CurrencyCode = {
  PolishZloty: 'PLN',
  Euro: 'EUR',
  UsDollar: 'USD',
  BritishPound: 'GBP',
  AustralianDollar: 'AUD',
  CanadianDollar: 'CAD',
  HungarianForint: 'HUF',
  SwissFranc: 'CHF',
  JapaneseYen: 'JPY',
  CzechKoruna: 'CZK',
  DanishKrone: 'DKK',
  NorwegianKrone: 'NOK',
  SwedishKrona: 'SEK',
} as const;
export type CurrencyCode = (typeof CurrencyCode)[keyof typeof CurrencyCode];
