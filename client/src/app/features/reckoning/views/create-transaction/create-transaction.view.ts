import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ArdiumDateInputModule,
  ArdiumFormFieldModule,
  ArdiumInputModule,
  ArdiumNumberInputModule,
  ArdiumSelectModule,
} from '@ardium-ui/ui';
import { CardWithHeadingComponent } from '@common/components/card-with-heading/card-with-heading.component';
import { CurrencyRateInputComponent } from '@common/components/currency-rate-input/currency-rate-input.component';
import { DataGridComponent } from '@common/components/data-grid/data-grid.component';
import { GridItemComponent } from '@common/components/data-grid/grid-item/grid-item.component';
import { SelectComponent } from '@common/components/select/select.component';
import { StackComponent } from '@common/components/stack/stack.component';
import { ViewH1Component } from '@common/components/view-h1/view-h1.component';
import { MapErrorPipe } from '@common/pipes/map-error.pipe';
import { WrapInAbstractControl } from '@common/utils/form-types';
import { CurrencyRatesService } from '@features/reckoning/services/currency-rates.service';
import { TransactionsService } from '@features/reckoning/services/transactions.service';
import { PayersAdderComponent } from '@features/reckoning/views/create-transaction/components/payers-adder/payers-adder.component';
import { ICreateTransactionRequestDto } from '@shared/contracts/transactions/create';
import { startWith } from 'rxjs';

@Component({
  selector: 'app-create-transaction',
  imports: [
    ArdiumFormFieldModule,
    ArdiumInputModule,
    ArdiumNumberInputModule,
    ArdiumSelectModule,
    ReactiveFormsModule,
    MapErrorPipe,
    StackComponent,
    CardWithHeadingComponent,
    ViewH1Component,
    SelectComponent,
    DataGridComponent,
    GridItemComponent,
    ArdiumDateInputModule,
    CurrencyRateInputComponent,
    PayersAdderComponent,
  ],
  templateUrl: './create-transaction.view.html',
  styleUrl: './create-transaction.view.scss',
})
export class CreateTransactionView {
  private readonly _currencyRatesService = inject(CurrencyRatesService);
  private readonly _transactionService = inject(TransactionsService);

  readonly TODAY = new Date();

  readonly form = new FormGroup({
    transaction: new FormGroup<WrapInAbstractControl<ICreateTransactionRequestDto['transaction']>>({
      name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      amount: new FormControl(null as unknown as number, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(0)],
      }),
      currencyCode: new FormControl(null as unknown as string, { nonNullable: true }),
      currencyRate: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0)] }),
      isCurrencyRateFromApi: new FormControl<boolean | null>(null, { validators: [Validators.required] }),
      transactionDate: new FormControl(this.TODAY, { nonNullable: true, validators: [Validators.required] }),
    }),
    payers: new FormControl<ICreateTransactionRequestDto['payers']>([], { nonNullable: true }),
    splitParts: new FormControl<ICreateTransactionRequestDto['splitParts']>([], { nonNullable: true }),
  });
  readonly formValue = toSignal(this.form.valueChanges.pipe(startWith(this.form.value)));
  readonly currencyCodeValue = computed<string>(() => this.formValue()!.transaction!.currencyCode!);
  readonly transactionDateValue = computed<Date>(() => this.formValue()!.transaction!.transactionDate!);

  readonly currencies = this._currencyRatesService.currencies;
  readonly isCurrencyRateLoading = signal<boolean>(false);

  constructor() {
    // set initial currency code to main currency if available
    let wasInitialCurrencySet = false;
    effect(() => {
      const mainCurrency = this._currencyRatesService.mainCurrency();

      if (!wasInitialCurrencySet && mainCurrency) {
        // wait for the select options to be initialized before setting the value to avoid warnings
        setTimeout(() => {
          this.form.controls.transaction.controls.currencyCode.setValue(mainCurrency, { emitEvent: false });
        }, 0);
        wasInitialCurrencySet = true;
      }
    });
    // disable currency code and rate if there's only one currency available
    effect(() => {
      const isMoreThanOneCurrency = this._currencyRatesService.isMoreThanOneCurrency();

      if (!isMoreThanOneCurrency) {
        this.form.controls.transaction.controls.currencyCode.disable({ emitEvent: false });
        this.form.controls.transaction.controls.currencyRate.disable({ emitEvent: false });
        this.form.controls.transaction.controls.isCurrencyRateFromApi.disable({ emitEvent: false });

        this.form.controls.transaction.controls.currencyRate.setValue(null);
        this.form.controls.transaction.controls.isCurrencyRateFromApi.setValue(null);
      } else {
        this.form.controls.transaction.controls.currencyCode.enable({ emitEvent: false });
      }
    });
    // fetch currency rate when currency code or transaction date changes, but only if the user hasn't manually edited the rate
    effect(async () => {
      const currencyCode = this.currencyCodeValue();
      const mainCurrency = this._currencyRatesService.mainCurrency();

      if (!currencyCode) {
        return;
      }

      const date = this.transactionDateValue();
      this.isCurrencyRateLoading.set(true);
      await untracked(() => this._currencyRatesService.fetchAndStoreCurrencyRate(currencyCode, date));
      this.isCurrencyRateLoading.set(false);

      if (this.form.controls.transaction.controls.currencyRate.touched) {
        return;
      }
      if (this.currencyCodeValue() === mainCurrency) {
        this.form.controls.transaction.controls.currencyRate.setValue(null, { emitEvent: false });
        this.form.controls.transaction.controls.isCurrencyRateFromApi.setValue(null, { emitEvent: false });
        return;
      }
      const rate = untracked(() => this._currencyRatesService.getCurrencyRate(currencyCode, date));
      this.form.controls.transaction.controls.currencyRate.setValue(rate, { emitEvent: false });
      this.form.controls.transaction.controls.isCurrencyRateFromApi.setValue(rate !== null, { emitEvent: false });
    });
    effect(() => {
      const currencyCode = this.currencyCodeValue();
      if (currencyCode) {
        this.form.controls.transaction.controls.currencyRate.markAsUntouched({ emitEvent: false });
      }
    });
  }
}
