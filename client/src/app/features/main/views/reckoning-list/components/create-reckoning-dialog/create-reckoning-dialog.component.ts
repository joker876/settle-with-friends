import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ArdiumDialogModule, ArdiumFormFieldModule, ArdiumInputModule } from '@ardium-ui/ui';
import { _BaseFormDialogComponent } from '@common/components/_bases/base-dialog';
import { WrapInAbstractControl } from '@common/utils/form-types';
import { ICreateReckoningRequestDto } from '@shared/contracts/reckonings/create';

@Component({
  selector: 'app-create-reckoning-dialog',
  imports: [ReactiveFormsModule, ArdiumDialogModule, ArdiumFormFieldModule, ArdiumInputModule],
  templateUrl: './create-reckoning-dialog.component.html',
  styleUrl: './create-reckoning-dialog.component.scss',
})
export class CreateReckoningDialogComponent extends _BaseFormDialogComponent<ICreateReckoningRequestDto> {
  override autoClose: boolean = false;

  public readonly form = new FormGroup<WrapInAbstractControl<ICreateReckoningRequestDto>>({
    name: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
  });
}
