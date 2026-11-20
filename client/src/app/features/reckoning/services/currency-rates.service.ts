import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, untracked } from '@angular/core';
import { mapSignal } from '@ardium-ui/devkit';
import { createSelectableOptions } from '@common/utils/options';
import { CurrencyCode } from '@shared/enums/currency-code';
import { format } from 'date-fns';
import { firstValueFrom } from 'rxjs';
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

const ALLOWED_CURRENCY_CODES = Object.values(CurrencyCode);

@Injectable({ providedIn: 'root' })
export class CurrencyRatesService {
  private readonly _http = inject(HttpClient);
  private readonly _reckoningService = inject(ReckoningService);

  private readonly _pendingRequests = new Map<CurrencyCodeDate, Promise<void>>();

  readonly mainCurrency = computed<CurrencyCode | null>(
    () => this._reckoningService.reckoning.value()?.mainCurrency ?? null,
  );
  readonly currencies = computed(() => {
    const reckoning = this._reckoningService.reckoning.value();
    if (!reckoning) {
      return [];
    }

    const currencies = Array.from(
      new Set([reckoning.mainCurrency, ...reckoning.helperCurrencies].filter(Boolean)),
    ).filter(v => ALLOWED_CURRENCY_CODES.includes(v));
    return createSelectableOptions(currencies);
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
  private readonly _currencyRatesLoading = mapSignal<CurrencyCodeDate, boolean>();

  getCurrencyRate(currencyCode: CurrencyCode, date: Date): number | null {
    const key = this._generateKey(currencyCode, date);
    return this._currencyRates.get(key) ?? null;
  }

  isCurrencyRateLoading(currencyCode: CurrencyCode, date: Date): boolean {
    const key = this._generateKey(currencyCode, date);
    return this._currencyRatesLoading.get(key) ?? false;
  }

  private _generateKey(currencyCode: CurrencyCode, date: Date): CurrencyCodeDate {
    return `${currencyCode}-${format(date, 'yyyy-MM-dd')}`;
  }

  async fetchAndStoreCurrencyRate(currencyCode: CurrencyCode, date: Date): Promise<void> {
    const requestedDate = new Date(date.getTime());
    const requestedKey = this._generateKey(currencyCode, requestedDate);

    if (this.mainCurrency() !== CurrencyCode.PolishZloty) {
      // NBP API only provides rates for PLN
      return;
    }
    if (currencyCode === this.mainCurrency()) {
      this._currencyRates.setKey(requestedKey, 1);
      return;
    }

    // rate is already in memory
    if (this._currencyRates.has(requestedKey)) {
      return;
    }

    // do not send two identical requests at the same time
    const pendingRequest = this._pendingRequests.get(requestedKey);
    if (pendingRequest) {
      return pendingRequest;
    }

    this._currencyRatesLoading.setKey(requestedKey, true);

    const request = (async () => {
      const maxDaysBack = 7;
      const checkedKeys: CurrencyCodeDate[] = [];

      for (let daysBack = 0; daysBack <= maxDaysBack; daysBack++) {
        const checkedDate = new Date(requestedDate.getTime());
        checkedDate.setDate(checkedDate.getDate() - daysBack);

        // automatically skip weekends
        if (checkedDate.getDay() === 0 || checkedDate.getDay() === 6) {
          continue;
        }

        const checkedKey = this._generateKey(currencyCode, checkedDate);
        checkedKeys.push(checkedKey);

        // check if the rate for the previous day is already in memory
        const cachedRate = this._currencyRates.get(checkedKey);

        if (cachedRate !== undefined) {
          this._currencyRates.setKey(requestedKey, cachedRate);
          return;
        }

        try {
          const response = await firstValueFrom(
            this._http.get<NBPCurrencyRateResponse>(
              `https://api.nbp.pl/api/exchangerates/rates/C/${currencyCode}/${format(checkedDate, 'yyyy-MM-dd')}/`,
            ),
          );

          const rate = response.rates[0]?.ask;
          if (rate === undefined) {
            return;
          }

          // store the rate under the checked dates...
          checkedKeys.forEach(key => this._currencyRates.setKey(key, rate));
          // ...and under the originally requested date
          this._currencyRates.setKey(requestedKey, rate);

          return;
        } catch (error: unknown) {
          const status = (error as { status?: number })?.status;

          // 404 means that the rate for the given date is not available
          if (status !== 404) {
            return;
          }
        }
      }
    })();

    this._pendingRequests.set(requestedKey, request);

    try {
      await request;
    } finally {
      this._pendingRequests.delete(requestedKey);
      this._currencyRatesLoading.setKey(requestedKey, false);
    }
  }
}
