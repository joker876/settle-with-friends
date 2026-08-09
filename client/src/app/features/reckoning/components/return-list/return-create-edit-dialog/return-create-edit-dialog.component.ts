import { Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
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
import { IReturn, IReturnBasicData } from '@shared/entities/return';
import { CurrencyCode } from '@shared/enums/currency-code';
import { startOfDay } from 'date-fns';
import { startWith } from 'rxjs';

@Component({
  selector: 'app-return-create-edit-dialog',
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
  templateUrl: './return-create-edit-dialog.component.html',
  styleUrl: './return-create-edit-dialog.component.scss',
})
export class ReturnCreateEditDialogComponent {
  private readonly _currencyRatesService = inject(CurrencyRatesService);
  private readonly _usersService = inject(UsersService);
  private readonly _authService = inject(AuthService);

  readonly TODAY = startOfDay(new UTCDate());

  fjkdf = effect(() => {
    console.log(this.TODAY);
  });

  readonly isOpen = input.required<boolean>();
  readonly isSubmitting = input.required<boolean>();

  readonly return = input.required<IReturn | null>();

  readonly isCreatingReturn = computed<boolean>(() => this.return() === null);

  readonly submit = output<IReturnBasicData>();
  readonly close = output<void>();

  readonly form = new FormGroup<WrapInAbstractControl<IReturnBasicData>>(
    {
      name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
      returnedByUserId: new FormControl<number>(null as unknown as number, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      returnedToUserId: new FormControl<number>(null as unknown as number, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      amount: new FormControl(null as unknown as number, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(0)],
      }),
      currencyCode: new FormControl(null as unknown as CurrencyCode, { nonNullable: true }),
      currencyRate: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0)] }),
      isCurrencyRateFromApi: new FormControl<boolean | null>(null, { validators: [Validators.required] }),
      returnDate: new FormControl(this.TODAY, { nonNullable: true, validators: [Validators.required] }),
    },
    {
      validators: [
        (control: AbstractControl): ValidationErrors | null => {
          const returnedByUserId = control.get('returnedByUserId')?.value;
          const returnedToUserId = control.get('returnedToUserId')?.value;

          if (returnedByUserId == null || returnedToUserId == null) {
            return null;
          }
          return returnedByUserId === returnedToUserId ? { sameReturnedUser: true } : null;
        },
      ],
    },
  );
  readonly formValue = toSignal(this.form.valueChanges.pipe(startWith(this.form.value)));
  readonly currencyCodeValue = computed<CurrencyCode>(() => this.formValue()!.currencyCode!);
  readonly returnDateValue = computed<Date>(() => this.formValue()!.returnDate!);

  readonly currencies = this._currencyRatesService.currencies;
  readonly mainCurrency = this._currencyRatesService.mainCurrency;
  readonly isCurrencyRateLoading = signal<boolean>(false);
  readonly currencyRateFromApi = computed<number | null>(() =>
    this._currencyRatesService.getCurrencyRate(this.currencyCodeValue(), this.returnDateValue()),
  );

  readonly userOptions = this._usersService.usersOptions;

  constructor() {
    // reset value every time the form is opened
    effect(() => {
      if (!this.isOpen()) {
        untracked(() => this.form.reset());
      }
    });
    // set value if is editing return
    effect(() => {
      const v = this.return();
      if (!v) return;

      untracked(() => {
        this.form.setValue({
          name: v.name,
          returnedByUserId: v.returnedByUserId,
          returnedToUserId: v.returnedToUserId,
          amount: v.amount,
          currencyCode: v.currencyCode,
          currencyRate: v.currencyRate,
          isCurrencyRateFromApi: v.isCurrencyRateFromApi,
          returnDate: v.returnDate,
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

      if (
        this.form.controls.returnedByUserId.getRawValue() === null &&
        currentUser &&
        this.userOptions().some(opt => opt.value === currentUser.id)
      ) {
        untracked(() => this.form.controls.returnedByUserId.setValue(currentUser.id));
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
    // fetch currency rate when currency code or return date changes, but only if the user hasn't manually edited the rate
    effect(async () => {
      const currencyCode = this.currencyCodeValue();
      const mainCurrency = this._currencyRatesService.mainCurrency();

      if (!currencyCode) {
        return;
      }

      const rtnControls = this.form.controls;
      const currencyRateTouched = rtnControls.currencyRate.touched;
      // fetch currency rate for selected date
      const date = this.returnDateValue();
      this.isCurrencyRateLoading.set(true);
      await untracked(() => this._currencyRatesService.fetchAndStoreCurrencyRate(currencyCode, date));
      this.isCurrencyRateLoading.set(false);

      // don't use currency rate if main currency is selected
      if (this.currencyCodeValue() === mainCurrency) {
        rtnControls.currencyRate.disable();
        rtnControls.isCurrencyRateFromApi.disable();
        return;
      }
      // get the fetched currency rate & set the values
      rtnControls.currencyRate.enable();
      rtnControls.isCurrencyRateFromApi.enable();
      // only set the value if it wasn't already set or wasn't touched
      if (!currencyRateTouched || rtnControls.currencyRate.getRawValue() === null) {
        const rate = untracked(() => this._currencyRatesService.getCurrencyRate(currencyCode, date));
        rtnControls.currencyRate.setValue(rate, { emitEvent: false });
        rtnControls.isCurrencyRateFromApi.setValue(rate !== null, { emitEvent: false });
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
