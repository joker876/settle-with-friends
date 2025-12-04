import { Directive, input, model, OnChanges, output, ResourceStatus, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { WrapInAbstractControl } from '@common/utils/form-types';

@Directive()
export abstract class _BaseFormDialogComponent<T extends Record<string, any>> implements OnChanges {
  readonly open = model.required<boolean>();

  readonly loadingStatus = input<ResourceStatus>('idle');

  readonly submit = output<T>();

  abstract readonly form: FormGroup<WrapInAbstractControl<T>>;

  readonly autoClose: boolean = true;

  onConfirm() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submit.emit(this.form.value as T);
    if (this.autoClose) {
      this.open.set(false);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && changes['open'].currentValue === true) {
      this.resetFormValue();
    }
  }

  resetFormValue() {
    this.form.reset();
  }
}
