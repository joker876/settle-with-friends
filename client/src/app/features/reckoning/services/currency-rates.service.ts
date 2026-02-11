import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, untracked } from '@angular/core';
import { mapSignal } from '@ardium-ui/devkit';
import { createSelectableOptions } from '@common/utils/options';
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

@Injectable({ providedIn: 'root' })
export class CurrencyRatesService {
  private readonly _http = inject(HttpClient);
  private readonly _reckoningService = inject(ReckoningService);

  readonly mainCurrency = computed<string | null>(() => this._reckoningService.reckoning.value()?.mainCurrency ?? null);
  readonly currencies = computed(() => {
    const reckoning = this._reckoningService.reckoning.value();
    return reckoning
      ? createSelectableOptions([reckoning.mainCurrency, reckoning.helperCurrency].filter(Boolean) as string[])
      : [];
  });
  readonly isMoreThanOneCurrency = computed<boolean>(() => this.currencies().length > 1);

  constructor() {
    // pre-fetch currency rates for all currencies except the main one for today
    effect(() => {
      const currencies = [...this.currencies()];
      currencies.shift(); // remove main currency

      for (const currency of currencies) {
        untracked(() => this.fetchAndStoreCurrencyRate(currency.value, new Date()));
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

  async fetchAndStoreCurrencyRate(currencyCode: string, date: Date, recursionIndex = 0): Promise<void> {
    const key = this._generateKey(currencyCode, date);

    if (currencyCode === this.mainCurrency()) {
      this._currencyRates.setKey(key, 1);
      return;
    }

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
    if (additionalKeys.length > 0 && this._currencyRates.has(additionalKeys[additionalKeys.length - 1])) {
      return;
    }

    return new Promise<void>(resolve => {
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
            resolve();
          },
          error: err => {
            this._currencyRates.delete(key);
            for (const additionalKey of additionalKeys) {
              this._currencyRates.delete(additionalKey);
            }
            // if the error is 404, it means that the rate for the given date is not available, so try with the previous date
            // to avoid infinite recursion, limit the number of retries to 7 (one week)
            // ideally the app should never request any future dates, but this is just a safety measure
            if (err.status === 404 && recursionIndex < 7) {
              date.setDate(date.getDate() - 1);
              this.fetchAndStoreCurrencyRate(currencyCode, date, recursionIndex + 1).then(() => resolve());
            } else {
              resolve();
            }
          },
        });
    });
  }
}
