import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ArdiumRadioModule } from '@ardium-ui/ui';
import { SelectableOption } from '@common/utils/options';

@Component({
  selector: 'app-radio-group',
  imports: [ArdiumRadioModule, ReactiveFormsModule],
  templateUrl: './radio-group.component.html',
  styleUrl: './radio-group.component.scss',
})
export class RadioGroupComponent {
  readonly control = input.required<FormControl<any>>();

  readonly options = input.required<SelectableOption[]>();
}
