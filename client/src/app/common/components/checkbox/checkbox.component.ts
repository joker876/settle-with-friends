import { Component, input, model, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, ReactiveFormsModule } from '@angular/forms';
import { BooleanLike, coerceBooleanProperty, trackBoundControl } from '@ardium-ui/devkit';
import { ArdIconCheckboxEmpty, ArdIconCheckboxFilled } from '@ardium-ui/icons';
import { ARD_FORM_FIELD_CONTROL, ArdFormFieldControl, ArdiumCheckboxModule } from '@ardium-ui/ui';
import { TakeChance } from 'take-chance';

@Component({
  selector: 'app-checkbox',
  imports: [ArdiumCheckboxModule, ArdIconCheckboxFilled, ArdIconCheckboxEmpty, ReactiveFormsModule],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  host: {
    '[class.disabled]': 'disabled',
    '[class.row-reverse]': 'rowReverse()',
    '[class.has-error]': 'hasError()',
  },
  providers: [{ provide: ARD_FORM_FIELD_CONTROL, useExisting: CheckboxComponent }],
})
export class CheckboxComponent implements ArdFormFieldControl, ControlValueAccessor, OnInit, OnDestroy {
  readonly value = model<boolean>(false);

  readonly reverseSelected = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });
  readonly rowReverse = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });
  readonly readonly = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });
  readonly contentLabel = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });
  readonly _hasError = input<boolean, BooleanLike>(false, {
    transform: v => coerceBooleanProperty(v),
    alias: 'hasError',
  });

  readonly label = input<string>('');

  //! ControlValueAccessor implementation
  writeValue(value: boolean): void {
    this.value.set(value);
  }
  registerOnChange(fn: (value: boolean) => void): void {
    this.value.subscribe(fn);
  }
  private _onTouched: () => void = () => {};
  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }
  emitTouched() {
    this._onTouched();
  }

  //! ArdFormFieldControl implementation
  readonly control = trackBoundControl(this);

  readonly htmlId = TakeChance.id();
  readonly disabled = this.control.disabled;
  readonly hasError = this.control.touchedHasErrors;

  ngOnInit(): void {
    this.control.init();
  }
  ngOnDestroy(): void {
    this.control.destroy();
  }
}
