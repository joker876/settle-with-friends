import { Component, computed, input, model, output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BooleanLike, coerceBooleanProperty, trackBoundControl } from '@ardium-ui/devkit';
import { ArdIconCheck, ArdIconChevron } from '@ardium-ui/icons';
import {
  AddCustomFn,
  ARD_FORM_FIELD_CONTROL,
  ArdFormFieldControl,
  ArdiumSelectModule,
  CompareWithFn,
  FormElementAppearance,
} from '@ardium-ui/ui';
import { SelectableOption } from '@common/utils/options';
import { isEqual } from 'lodash';
import { Observable } from 'rxjs';
import TakeChance from 'take-chance';

@Component({
  selector: 'app-select',
  imports: [ArdiumSelectModule, ArdIconCheck, ArdIconChevron],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: SelectComponent, multi: true },
    { provide: ARD_FORM_FIELD_CONTROL, useExisting: SelectComponent },
  ],
})
export class SelectComponent implements ControlValueAccessor, ArdFormFieldControl {
  readonly options = input.required<SelectableOption<any>[]>();
  readonly areOptionsLoading = input<boolean>(false);
  readonly searchable = input<boolean, BooleanLike>(true, { transform: v => coerceBooleanProperty(v) });
  readonly _disabled = input<boolean, BooleanLike>(false, {
    transform: v => coerceBooleanProperty(v),
    alias: 'disabled',
  });

  readonly dynamicLabelMap = input<Record<string | number, string> | null>(null);

  readonly placeholder = input<string>('');

  readonly appearance = input<FormElementAppearance>(FormElementAppearance.Filled);

  readonly addCustomFn = input<AddCustomFn<any> | AddCustomFn<Promise<any>> | AddCustomFn<Observable<any>> | false>(
    false,
  );
  readonly compareWithFn = computed<CompareWithFn | null>(() =>
    this.options().some(opt => typeof opt.value === 'object') ? isEqual : null,
  );

  readonly withPrefix = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });

  readonly close = output<void>();
  readonly change = output<any>();

  readonly value = model<any>(null);

  writeValue(value: any): void {
    this.value.set(value);
  }
  registerOnChange(fn: (value: any) => void): void {
    this.value.subscribe(fn);
  }
  private _onTouched: () => void = () => {};
  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }
  emitTouched(): void {
    this._onTouched?.();
  }

  private readonly _control = trackBoundControl(this);

  readonly htmlId = input<string>(TakeChance.id());
  readonly disabled = computed(() => this._disabled() || this._control.disabled());
  readonly hasError = this._control.touchedHasErrors;
}
