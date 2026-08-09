import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { ArdIconEditLine_2 } from '@ardium-ui/icons';
import { ArdiumButtonModule, ArdiumFormFieldModule, ArdiumGridModule, ArdiumIconButtonModule, ArdiumInputModule, ArdiumSpinnerModule, ArdiumStackModule } from '@ardium-ui/ui';
import { SelectComponent } from '@common/components/select/select.component';
import { CURRENCY_OPTIONS } from '@common/utils/currency-options';
import { WrapInAbstractControl } from '@common/utils/form-types';
import { RoleGuardComponent } from '@features/reckoning/components/role-guard/role-guard.component';
import { ReckoningService } from '@features/reckoning/services/reckoning.service';
import { IUpdateReckoningRequestDto } from '@shared/contracts/reckonings/update';
import { CurrencyCode } from '@shared/enums/currency-code';
import { UserRole } from '@shared/enums/user-role';

@Component({
  selector: 'app-settings-reckoning-section',
  imports: [
    ArdiumButtonModule,
    ArdiumStackModule,
    ArdiumFormFieldModule,
    ArdiumInputModule,
    ReactiveFormsModule,
    RoleGuardComponent,
    ArdiumIconButtonModule,
    ArdIconEditLine_2,
    ArdiumGridModule,
    SelectComponent,
    MatTooltip,
    ArdiumSpinnerModule
],
  templateUrl: './reckoning.section.html',
  styleUrl: './reckoning.section.scss',
})
export class ReckoningSection {
  readonly reckoningService = inject(ReckoningService);

  readonly UserRole = UserRole;

  readonly isEditingName = signal(false);
  readonly isEditingHelperCurrencies = signal(false);

  public readonly form = new FormGroup<WrapInAbstractControl<IUpdateReckoningRequestDto>>({
    name: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
    mainCurrency: new FormControl<CurrencyCode>(CurrencyCode.PolishZloty, {
      validators: [Validators.required],
      nonNullable: true,
    }),
    helperCurrencies: new FormControl<CurrencyCode[]>([], { validators: [], nonNullable: true }),
  });

  readonly existingHelperCurrencies = computed(() => {
    const reckoning = this.reckoningService.reckoning.value();
    if (!reckoning) return [];

    return reckoning.helperCurrencies;
  });

  readonly currencyOptionsWithoutExisting = computed(() => {
    const reckoning = this.reckoningService.reckoning.value();
    if (!reckoning) return [];

    return CURRENCY_OPTIONS.filter(
      option => option.value !== reckoning.mainCurrency && !reckoning.helperCurrencies.includes(option.value),
    );
  });

  constructor() {
    // update form values when reckoning changes
    effect(() => {
      const reckoning = this.reckoningService.reckoning.value();
      if (!reckoning) return;

      untracked(() =>
        this.form.reset(
          {
            name: reckoning.name,
            mainCurrency: reckoning.mainCurrency,
            helperCurrencies: [],
          },
          { overwriteDefaultValue: true },
        ),
      );
    });
  }

  discardChanges() {
    this.isEditingName.set(false);
    this.isEditingHelperCurrencies.set(false);

    this.form.reset();
  }

  saveChanges() {
    if (this.form.invalid) return;

    const formValue = this.form.getRawValue();

    this.reckoningService.updateReckoning({
      name: formValue.name,
      mainCurrency: formValue.mainCurrency,
      helperCurrencies: [...this.existingHelperCurrencies(), ...formValue.helperCurrencies],
    }).then(success => {
      if (success) {
        this.isEditingName.set(false);
        this.isEditingHelperCurrencies.set(false);
      }
    });
  }
}
