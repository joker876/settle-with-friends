import { Component, computed, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BooleanLike, coerceBooleanProperty } from '@ardium-ui/devkit';
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
  imports: [ArdiumSelectModule, ReactiveFormsModule, ArdIconCheck, ArdIconChevron],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  providers: [{ provide: ARD_FORM_FIELD_CONTROL, useExisting: SelectComponent }],
})
export class SelectComponent implements ArdFormFieldControl {
  readonly control = input.required<FormControl<any>>();

  readonly options = input.required<SelectableOption<any>[]>();
  readonly areOptionsLoading = input<boolean>(false);
  readonly searchable = input<boolean, BooleanLike>(true, { transform: v => coerceBooleanProperty(v) });

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

  readonly htmlId = input<string>(TakeChance.id());

  readonly close = output<void>();
  readonly change = output<any>();

  readonly disabled = (): boolean => this.control().disabled;
  readonly hasError = (): boolean => this.control().invalid && this.control().touched;
}
