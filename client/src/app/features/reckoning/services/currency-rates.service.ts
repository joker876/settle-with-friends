import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable } from '@angular/core';
import { mapSignal } from '@ardium-ui/devkit';
import { format } from 'date-fns';
import { ReckoningService } from './reckoning.service';

type CurrencyCodeDate = string; // e.g. 'EUR-2023-10-15'

type NBPCurrencyRateResponse = {
  table: 'C';
  currency: string;
  code: string;
  rates: [
    {
      no: string;
      effectiveDate: string;
      bid: number;
      ask: number;
    },
  ];
};

@Injectable()
export class CurrencyRatesService {
  private readonly _http = inject(HttpClient);
  private readonly _reckoningService = inject(ReckoningService);

  readonly currencies = computed<string[]>(() => {
    const reckoning = this._reckoningService.reckoning.value();
    return reckoning ? ([reckoning.mainCurrency, reckoning.helperCurrency].filter(Boolean) as string[]) : [];
  });
  readonly isMoreThanOneCurrency = computed<boolean>(() => this.currencies().length > 1);

  constructor() {
    // pre-fetch currency rates for all currencies except the main one for today
    effect(() => {
      const currencies = this.currencies();
      currencies.shift(); // remove main currency

      for (const currency of currencies) {
        this.fetchAndStoreCurrencyRate(currency, new Date());
      }
    });
  }

  private readonly _currencyRates = mapSignal<CurrencyCodeDate, number>();

  getCurrencyRate(currencyCode: string, date: Date): number | null {
    const key = this._generateKey(currencyCode, date);
    return this._currencyRates.get(key) ?? null;
  }

  private _generateKey(currencyCode: string, date: Date): CurrencyCodeDate {
    return `${currencyCode}-${format(date, 'yyyy-MM-dd')}`;
  }

  fetchAndStoreCurrencyRate(currencyCode: string, date: Date): void {
    const key = this._generateKey(currencyCode, date);

    if (this._currencyRates.has(key)) {
      return;
    }
    // NBP does not provide rates for weekends, so adjust the date to the last business day
    let additionalKeys: string[] = [];
    while (date.getDay() === 0 || date.getDay() === 6) {
      date.setDate(date.getDate() - 1);

      additionalKeys.push(this._generateKey(currencyCode, date));
    }
    // also check if we have the rate for the last business day already
    if (additionalKeys.length > 0 && !this._currencyRates.has(additionalKeys[additionalKeys.length - 1])) {
      return;
    }

    this._http
      .get<NBPCurrencyRateResponse>(
        `https://api.nbp.pl/api/exchangerates/rates/C/${currencyCode}/${format(date, 'yyyy-MM-dd')}/`,
      )
      .subscribe({
        next: res => {
          const rate = res.rates[0].ask;

          this._currencyRates.setKey(key, rate);
          for (const additionalKey of additionalKeys) {
            this._currencyRates.setKey(additionalKey, rate);
          }
        },
        error: () => {
          this._currencyRates.delete(key);
          for (const additionalKey of additionalKeys) {
            this._currencyRates.delete(additionalKey);
          }
        },
      });
  }
}
