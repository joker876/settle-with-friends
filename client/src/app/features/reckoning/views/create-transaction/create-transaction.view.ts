import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ArdiumButtonModule,
  ArdiumDateInputModule,
  ArdiumFormFieldModule,
  ArdiumGridModule,
  ArdiumInputModule,
  ArdiumNumberInputModule,
  ArdiumSelectModule,
} from '@ardium-ui/ui';
import { CardWithHeadingComponent } from '@common/components/card-with-heading/card-with-heading.component';
import { CurrencyRateInputComponent } from '@common/components/currency-rate-input/currency-rate-input.component';
import { SelectComponent } from '@common/components/select/select.component';
import { StackComponent } from '@common/components/stack/stack.component';
import { ViewH1Component } from '@common/components/view-h1/view-h1.component';
import { WrapInAbstractControl } from '@common/utils/form-types';
import { CurrencyRatesService } from '@features/reckoning/services/currency-rates.service';
import { PayersAdderComponent } from '@features/reckoning/views/create-transaction/components/payers-adder/payers-adder.component';
import { ICreateTransactionRequestDto } from '@shared/contracts/transactions/create';
import { IUpdateTransactionRequestDto } from '@shared/contracts/transactions/update';
import { CurrencyCode } from '@shared/enums/currency-code';
import { map, startWith } from 'rxjs';
import { SplitPartsAdderComponent } from './components/split-parts-adder/split-parts-adder.component';
import { CreateTransactionService } from './create-transaction.service';

@Component({
  selector: 'app-create-transaction-view',
  imports: [
    ArdiumFormFieldModule,
    ArdiumInputModule,
    ArdiumNumberInputModule,
    ArdiumSelectModule,
    ReactiveFormsModule,
    StackComponent,
    CardWithHeadingComponent,
    ViewH1Component,
    SelectComponent,
    ArdiumDateInputModule,
    CurrencyRateInputComponent,
    PayersAdderComponent,
    ArdiumGridModule,
    SplitPartsAdderComponent,
    ArdiumButtonModule,
  ],
  templateUrl: './create-transaction.view.html',
  styleUrl: './create-transaction.view.scss',
  providers: [CreateTransactionService],
})
export class CreateTransactionView {
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly _currencyRatesService = inject(CurrencyRatesService);
  private readonly _createTransactionService = inject(CreateTransactionService);

  readonly TODAY = new Date();

  private readonly _editedTransactionId = toSignal(
    this._route.paramMap.pipe(
      map(p => p.get('transactionId')),
      map(id => (typeof id === 'string' ? Number(id) : null)),
    ),
    { initialValue: null },
  );
  readonly isCreateMode = toSignal(this._route.data.pipe(map(v => v['isCreateMode'] === true)), {
    initialValue: null,
  });

  readonly form = new FormGroup({
    transaction: new FormGroup<WrapInAbstractControl<ICreateTransactionRequestDto['transaction']>>({
      name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      amount: new FormControl(null as unknown as number, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(0)],
      }),
      currencyCode: new FormControl(null as unknown as CurrencyCode, { nonNullable: true }),
      currencyRate: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0)] }),
      isCurrencyRateFromApi: new FormControl<boolean | null>(null, { validators: [Validators.required] }),
      transactionDate: new FormControl(this.TODAY, { nonNullable: true, validators: [Validators.required] }),
    }),
    payers: new FormControl<IUpdateTransactionRequestDto['payers']>([], {
      nonNullable: true,
      validators: [Validators.required],
    }),
    splitParts: new FormControl<IUpdateTransactionRequestDto['splitParts']>([], {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });
  readonly formValue = toSignal(this.form.valueChanges.pipe(startWith(this.form.value)));
  readonly currencyCodeValue = computed<CurrencyCode>(() => this.formValue()!.transaction!.currencyCode!);
  readonly transactionDateValue = computed<Date>(() => this.formValue()!.transaction!.transactionDate!);

  readonly currencies = this._currencyRatesService.currencies;
  readonly isCurrencyRateLoading = signal<boolean>(false);
  readonly currencyRateFromApi = computed<number | null>(() =>
    this._currencyRatesService.getCurrencyRate(this.currencyCodeValue(), this.transactionDateValue()),
  );

  constructor() {
    // sync transaction id with service
    effect(() => {
      const id = this._editedTransactionId();
      this._createTransactionService.setTransactionId(id);
    });
    // set value if is editing transaction
    effect(() => {
      const v = this._createTransactionService.transactionData.value();
      if (!v) return;

      untracked(() => {
        this.form.setValue({
          transaction: {
            name: v.name,
            amount: v.amount,
            currencyCode: v.currencyCode,
            currencyRate: v.currencyRate,
            isCurrencyRateFromApi: v.isCurrencyRateFromApi,
            transactionDate: v.transactionDate,
          },
          payers: v.payers,
          splitParts: v.splitParts.map(part => ({
            id: part.id,
            name: part.name,
            amount: part.amount,
            includees: part.includees.map(inc => inc.userId),
          })),
        });
        this.form.markAllAsTouched();
      });
    });
    // set initial currency code to main currency if available
    effect(() => {
      const mainCurrency = this._currencyRatesService.mainCurrency();

      if (this.form.controls.transaction.controls.currencyCode.getRawValue() === null && mainCurrency) {
        // wait for the select options to be initialized before setting the value to avoid warnings
        untracked(() => this.form.controls.transaction.controls.currencyCode.setValue(mainCurrency));
      }
    });
    // disable currency code and rate if there's only one currency available
    effect(() => {
      const isMoreThanOneCurrency = this._currencyRatesService.isMoreThanOneCurrency();

      if (!isMoreThanOneCurrency) {
        this.form.controls.transaction.controls.currencyCode.disable();
        this.form.controls.transaction.controls.currencyRate.disable();
        this.form.controls.transaction.controls.isCurrencyRateFromApi.disable();

        this.form.controls.transaction.controls.currencyRate.setValue(null);
        this.form.controls.transaction.controls.isCurrencyRateFromApi.setValue(null);
      } else {
        this.form.controls.transaction.controls.currencyCode.enable();
      }
    });
    // fetch currency rate when currency code or transaction date changes, but only if the user hasn't manually edited the rate
    effect(async () => {
      const currencyCode = this.currencyCodeValue();
      const mainCurrency = this._currencyRatesService.mainCurrency();

      if (!currencyCode) {
        return;
      }

      const transxControls = this.form.controls.transaction.controls;
      const currencyRateTouched = transxControls.currencyRate.touched;
      // fetch currency rate for selected date
      const date = this.transactionDateValue();
      this.isCurrencyRateLoading.set(true);
      await untracked(() => this._currencyRatesService.fetchAndStoreCurrencyRate(currencyCode, date));
      this.isCurrencyRateLoading.set(false);

      // don't use currency rate if main currency is selected
      if (this.currencyCodeValue() === mainCurrency) {
        transxControls.currencyRate.disable();
        transxControls.isCurrencyRateFromApi.disable();
        return;
      }
      // get the fetched currency rate & set the values
      transxControls.currencyRate.enable();
      transxControls.isCurrencyRateFromApi.enable();
      // only set the value if it wasn't already set or wasn't touched
      if (!currencyRateTouched || transxControls.currencyRate.getRawValue() === null) {
        const rate = untracked(() => this._currencyRatesService.getCurrencyRate(currencyCode, date));
        transxControls.currencyRate.setValue(rate, { emitEvent: false });
        transxControls.isCurrencyRateFromApi.setValue(rate !== null, { emitEvent: false });
      }
    });
    // every time the user changes the currency code, mark the currency rate as untouched
    effect(() => {
      const code = this.currencyCodeValue();
      if (code) {
        this.form.controls.transaction.controls.currencyRate.markAsUntouched({ emitEvent: false });
      }
    });
  }

  private _navigateToTransactionList() {
    this._router.navigate([this.isCreateMode() ? '../' : '../../'], { relativeTo: this._route });
  }

  onCancelClick() {
    this._navigateToTransactionList();
  }
  async onCreateClick() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const success = await this._createTransactionService.createTransaction(this.form.getRawValue());
    if (!success) return;

    this._navigateToTransactionList();
  }
  async onUpdateClick() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const success = await this._createTransactionService.updateTransaction(
      this._editedTransactionId()!,
      this.form.getRawValue(),
    );
    if (!success) return;

    this._navigateToTransactionList();
  }
}
