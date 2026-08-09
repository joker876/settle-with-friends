import { Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ArdiumDialogModule, ArdiumFormFieldModule, ArdiumGridModule, ArdiumInputModule, ArdiumStackModule } from '@ardium-ui/ui';
import { _BaseFormDialogComponent } from '@common/components/_bases/base-dialog';
import { SelectComponent } from '@common/components/select/select.component';
import { CURRENCY_OPTIONS } from '@common/utils/currency-options';
import { WrapInAbstractControl } from '@common/utils/form-types';
import { ICreateReckoningRequestDto } from '@shared/contracts/reckonings/create';
import { CurrencyCode } from '@shared/enums/currency-code';

@Component({
  selector: 'app-create-reckoning-dialog',
  imports: [
    ReactiveFormsModule,
    ArdiumDialogModule,
    ArdiumFormFieldModule,
    ArdiumInputModule,
    ArdiumGridModule,
    SelectComponent,
    ArdiumStackModule
],
  templateUrl: './create-reckoning-dialog.component.html',
  styleUrl: './create-reckoning-dialog.component.scss',
})
export class CreateReckoningDialogComponent extends _BaseFormDialogComponent<ICreateReckoningRequestDto> {
  override autoClose: boolean = false;

  public readonly form = new FormGroup<WrapInAbstractControl<ICreateReckoningRequestDto>>({
    name: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
    mainCurrency: new FormControl<CurrencyCode>(CurrencyCode.PolishZloty, {
      validators: [Validators.required],
      nonNullable: true,
    }),
    helperCurrencies: new FormControl<CurrencyCode[]>([], { validators: [], nonNullable: true }),
  });
  readonly mainCurrency = toSignal(this.form.controls.mainCurrency.valueChanges, {
    initialValue: this.form.controls.mainCurrency.value,
  });

  readonly ALL_CURRENCY_OPTIONS = CURRENCY_OPTIONS;
  readonly currencyOptionsWithoutMain = computed(() => {
    const mainCurrency = this.mainCurrency();
    return CURRENCY_OPTIONS.filter(option => option.value !== mainCurrency);
  })
}
