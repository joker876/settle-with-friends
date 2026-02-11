import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ArdiumFormFieldModule, ArdiumInputModule, ArdiumNumberInputModule, ArdiumSelectModule } from '@ardium-ui/ui';
import { MapErrorPipe } from '@common/pipes/map-error.pipe';
import { WrapInAbstractControl } from '@common/utils/form-types';
import { CurrencyRatesService } from '@features/reckoning/services/currency-rates.service';
import { TransactionsService } from '@features/reckoning/services/transactions.service';
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
  ],
  templateUrl: './create-transaction.view.html',
  styleUrl: './create-transaction.view.scss',
})
export class CreateTransactionView {
  private readonly _currencyRatesService = inject(CurrencyRatesService);
  private readonly _transactionService = inject(TransactionsService);

  readonly form = new FormGroup<WrapInAbstractControl<ICreateTransactionRequestDto['transaction']>>({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    amount: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    currencyCode: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    currencyRate: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0)] }),
    isCurrencyRateFromApi: new FormControl<boolean | null>(null, { validators: [Validators.required] }),
    transactionDate: new FormControl(new Date(), { nonNullable: true, validators: [Validators.required] }),
  });
  readonly formValue = toSignal(this.form.valueChanges.pipe(startWith(this.form.value)));
  readonly currencyCodeValue = computed<string>(() => this.formValue()!.currencyCode!);
  readonly transactionDateValue = computed<Date>(() => this.formValue()!.transactionDate!);

  constructor() {
    effect(() => {
      const isMoreThanOneCurrency = this._currencyRatesService.isMoreThanOneCurrency();

      if (!isMoreThanOneCurrency) {
        this.form.controls.currencyCode.disable({ emitEvent: false });
        this.form.controls.currencyRate.disable({ emitEvent: false });
        this.form.controls.isCurrencyRateFromApi.disable({ emitEvent: false });

        this.form.controls.currencyRate.setValue(null);
        this.form.controls.isCurrencyRateFromApi.setValue(null);
      } else {
        this.form.controls.currencyCode.enable({ emitEvent: false });
      }
    });
    effect(() => {
      const currencyCode = this.currencyCodeValue();

      if (currencyCode !== this._currencyRatesService.currencies()[0]) {
        const rate = this._currencyRatesService.getCurrencyRate(currencyCode, this.transactionDateValue());

        this.form.controls.currencyRate.enable({ emitEvent: false });
        this.form.controls.isCurrencyRateFromApi.enable({ emitEvent: false });

        this.form.controls.currencyRate.setValue(rate);
        this.form.controls.isCurrencyRateFromApi.setValue(rate !== null);
      }
    });
  }

  readonly shouldShowRatePicker = computed<boolean>(() => {
    const mainCurrency = this._currencyRatesService.currencies()[0];
    return (
      this._currencyRatesService.isMoreThanOneCurrency() &&
      !!mainCurrency &&
      this.formValue()?.currencyCode !== mainCurrency
    );
  });
}
