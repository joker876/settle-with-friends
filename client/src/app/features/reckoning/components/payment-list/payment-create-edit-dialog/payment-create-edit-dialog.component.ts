import { Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ArdiumDateInputModule,
  ArdiumDialogModule,
  ArdiumFormFieldModule,
  ArdiumGridModule,
  ArdiumInputModule,
  ArdiumNumberInputModule,
} from '@ardium-ui/ui';
import { CurrencyRateInputComponent } from '@common/components/currency-rate-input/currency-rate-input.component';
import { SelectComponent } from '@common/components/select/select.component';
import { AuthService } from '@common/services/auth.service';
import { WrapInAbstractControl } from '@common/utils/form-types';
import { UTCDate } from '@date-fns/utc';
import { CurrencyRatesService } from '@features/reckoning/services/currency-rates.service';
import { UsersService } from '@features/reckoning/services/users.service';
import { IPayment, IPaymentBasicData } from '@shared/entities/payment';
import { startOfDay } from 'date-fns';
import { startWith } from 'rxjs';

@Component({
  selector: 'app-payment-create-edit-dialog',
  imports: [
    ArdiumDialogModule,
    ArdiumGridModule,
    ArdiumFormFieldModule,
    ArdiumInputModule,
    ArdiumDateInputModule,
    ArdiumNumberInputModule,
    ReactiveFormsModule,
    SelectComponent,
    CurrencyRateInputComponent,
  ],
  templateUrl: './payment-create-edit-dialog.component.html',
  styleUrl: './payment-create-edit-dialog.component.scss',
})
export class PaymentCreateEditDialogComponent {
  private readonly _currencyRatesService = inject(CurrencyRatesService);
  private readonly _usersService = inject(UsersService);
  private readonly _authService = inject(AuthService);

  readonly TODAY = startOfDay(new UTCDate());

  fjkdf = effect(() => {
    console.log(this.TODAY);
  });

  readonly isOpen = input.required<boolean>();
  readonly isSubmitting = input.required<boolean>();

  readonly payment = input.required<IPayment | null>();

  readonly isCreatingPayment = computed<boolean>(() => this.payment() === null);

  readonly submit = output<IPaymentBasicData>();
  readonly close = output<void>();

  readonly form = new FormGroup<WrapInAbstractControl<IPaymentBasicData>>({
    name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    paidByUserId: new FormControl<number>(null as unknown as number, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    amount: new FormControl(null as unknown as number, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    currencyCode: new FormControl(null as unknown as string, { nonNullable: true }),
    currencyRate: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0)] }),
    isCurrencyRateFromApi: new FormControl<boolean | null>(null, { validators: [Validators.required] }),
    paymentDate: new FormControl(this.TODAY, { nonNullable: true, validators: [Validators.required] }),
  });
  readonly formValue = toSignal(this.form.valueChanges.pipe(startWith(this.form.value)));
  readonly currencyCodeValue = computed<string>(() => this.formValue()!.currencyCode!);
  readonly paymentDateValue = computed<Date>(() => this.formValue()!.paymentDate!);

  readonly currencies = this._currencyRatesService.currencies;
  readonly mainCurrency = this._currencyRatesService.mainCurrency;
  readonly isCurrencyRateLoading = signal<boolean>(false);
  readonly currencyRateFromApi = computed<number | null>(() =>
    this._currencyRatesService.getCurrencyRate(this.currencyCodeValue(), this.paymentDateValue()),
  );

  readonly userOptions = this._usersService.usersOptions;

  constructor() {
    // set value if is editing payment
    effect(() => {
      const v = this.payment();
      if (!v) return;

      untracked(() => {
        this.form.setValue({
          name: v.name,
          paidByUserId: v.paidByUserId,
          amount: v.amount,
          currencyCode: v.currencyCode,
          currencyRate: v.currencyRate,
          isCurrencyRateFromApi: v.isCurrencyRateFromApi,
          paymentDate: v.paymentDate,
        });
        this.form.markAllAsTouched();
      });
    });
    // set initial currency code to main currency if available
    effect(() => {
      const mainCurrency = this._currencyRatesService.mainCurrency();

      if (this.form.controls.currencyCode.getRawValue() === null && mainCurrency) {
        untracked(() => this.form.controls.currencyCode.setValue(mainCurrency));
      }
    });
    // set initial paid by user id to current user if available
    effect(() => {
      const currentUser = this._authService.userData();

      if (this.form.controls.paidByUserId.getRawValue() === null && currentUser && this.userOptions().some(opt => opt.value === currentUser.id)) {
        untracked(() => this.form.controls.paidByUserId.setValue(currentUser.id));
      }
    });
    // disable currency code and rate if there's only one currency available
    effect(() => {
      const isMoreThanOneCurrency = this._currencyRatesService.isMoreThanOneCurrency();

      if (!isMoreThanOneCurrency) {
        this.form.controls.currencyCode.disable();
        this.form.controls.currencyRate.disable();
        this.form.controls.isCurrencyRateFromApi.disable();

        this.form.controls.currencyRate.setValue(null);
        this.form.controls.isCurrencyRateFromApi.setValue(null);
      } else {
        this.form.controls.currencyCode.enable();
      }
    });
    // fetch currency rate when currency code or payment date changes, but only if the user hasn't manually edited the rate
    effect(async () => {
      const currencyCode = this.currencyCodeValue();
      const mainCurrency = this._currencyRatesService.mainCurrency();

      if (!currencyCode) {
        return;
      }

      const pmntControls = this.form.controls;
      const currencyRateTouched = pmntControls.currencyRate.touched;
      // fetch currency rate for selected date
      const date = this.paymentDateValue();
      this.isCurrencyRateLoading.set(true);
      await untracked(() => this._currencyRatesService.fetchAndStoreCurrencyRate(currencyCode, date));
      this.isCurrencyRateLoading.set(false);

      // don't use currency rate if main currency is selected
      if (this.currencyCodeValue() === mainCurrency) {
        pmntControls.currencyRate.disable();
        pmntControls.isCurrencyRateFromApi.disable();
        return;
      }
      // get the fetched currency rate & set the values
      pmntControls.currencyRate.enable();
      pmntControls.isCurrencyRateFromApi.enable();
      // only set the value if it wasn't already set or wasn't touched
      if (!currencyRateTouched || pmntControls.currencyRate.getRawValue() === null) {
        const rate = untracked(() => this._currencyRatesService.getCurrencyRate(currencyCode, date));
        pmntControls.currencyRate.setValue(rate, { emitEvent: false });
        pmntControls.isCurrencyRateFromApi.setValue(rate !== null, { emitEvent: false });
      }
    });
    // every time the user changes the currency code, mark the currency rate as untouched
    effect(() => {
      const code = this.currencyCodeValue();
      if (code) {
        this.form.controls.currencyRate.markAsUntouched({ emitEvent: false });
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submit.emit(this.form.getRawValue());
  }
}
