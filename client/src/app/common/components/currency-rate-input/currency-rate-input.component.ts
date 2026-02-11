import { Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ArdiumDialogModule, ArdiumIconButtonModule, ArdiumNumberInputModule } from '@ardium-ui/ui';
import { ArdIconEditLine_2 } from '@common/icons/edit-line-2.icon';
import { BalanceComponent } from '../balance/balance.component';
import { StatisticWithValueComponent } from '../statistic-with-value/statistic-with-value.component';

@Component({
  selector: 'app-currency-rate-input',
  imports: [
    ArdiumDialogModule,
    ArdIconEditLine_2,
    StatisticWithValueComponent,
    BalanceComponent,
    ArdiumIconButtonModule,
    ArdiumNumberInputModule,
  ],
  templateUrl: './currency-rate-input.component.html',
  styleUrl: './currency-rate-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CurrencyRateInputComponent),
      multi: true,
    }
  ]
})
export class CurrencyRateInputComponent implements ControlValueAccessor {
  readonly currencyCode = input.required<string>();
  readonly mainCurrency = input.required<string>();
  readonly isValueLoading = input.required<boolean>();

  readonly isCurrencyRateFromApiControl = input.required<FormControl<boolean | null>>();

  readonly value = signal<number | null>(null);
  readonly tempValue = signal<number | null>(null);

  readonly isDialogOpen = signal<boolean>(false);

  openDialog(): void {
    this.isDialogOpen.set(true);
    this.tempValue.set(this.value());
  }
  onConfirmDialog(): void {
    this.value.set(this.tempValue());
    this._onChange(this.value());
    this._onTouched();
    this.isDialogOpen.set(false);
    this.isCurrencyRateFromApiControl().setValue(true, { emitEvent: false });
  }

  writeValue(value: number | null): void {
    this.value.set(value);
  }

  private _onChange: (value: number | null) => void = () => {};
  private _onTouched: () => void = () => {};

  registerOnChange(fn: (value: number | null) => void): void {
    this._onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }
}
