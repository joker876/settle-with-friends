import { Component, computed, effect, forwardRef, inject, input, OnDestroy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ControlValueAccessor,
  FormArray,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ArdiumErrorDirective,
  ArdiumFormFieldModule,
  ArdiumIconButtonModule,
  ArdiumNumberInputModule,
} from '@ardium-ui/ui';
import { SelectComponent } from '@common/components/select/select.component';
import { ArdIconTrashCan_2 } from '@common/icons/trash-can-2.icon';
import { MapErrorPipe } from '@common/pipes/map-error.pipe';
import { WrapInAbstractControl } from '@common/utils/form-types';
import { SelectableOption } from '@common/utils/options';
import { UsersService } from '@features/reckoning/services/users.service';
import { map, startWith, Subscription } from 'rxjs';

@Component({
  selector: 'app-payers-adder',
  imports: [
    ReactiveFormsModule,
    ArdiumFormFieldModule,
    ArdiumNumberInputModule,
    ArdiumIconButtonModule,
    SelectComponent,
    ArdIconTrashCan_2,
    MapErrorPipe,
    ArdiumErrorDirective,
  ],
  templateUrl: './payers-adder.component.html',
  styleUrl: './payers-adder.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PayersAdderComponent),
      multi: true,
    },
  ],
})
export class PayersAdderComponent implements ControlValueAccessor, OnDestroy {
  private readonly _usersService = inject(UsersService);

  readonly totalAmount = input<number | null>(null);
  readonly currencyCode = input<string | null>(null);
  readonly PayerAmountType = PayerAmountType;

  readonly payers = new FormArray<FormGroup<WrapInAbstractControl<PayerFormValue>>>([]);
  readonly newUserIdControl = new FormControl<number | null>(null);

  readonly usersOptions = this._usersService.usersOptions;
  readonly userMap = this._usersService.userMap;
  readonly amountTypeOptions: SelectableOption<PayerAmountType>[] = [
    { label: $localize`:@@common.amount-ellipsis:Kwota...`, value: PayerAmountType.Amount },
    { label: $localize`:@@common.remaining-titlecase:Reszta`, value: PayerAmountType.Remaining },
  ];

  private readonly _payersValue = toSignal(
    this.payers.valueChanges.pipe(
      startWith(this.payers.getRawValue()),
      map(() => this.payers.getRawValue() as PayerFormValue[]),
    ),
    { initialValue: [] as PayerFormValue[] },
  );

  readonly remainingUsersOptions = computed(() => {
    const usedIds = new Set(this._payersValue().map(payer => payer.userId));
    return this.usersOptions().filter(option => !usedIds.has(option.value));
  });
  readonly remainingAmount = computed(() => {
    const total = this.totalAmount();
    if (total === null || total === undefined) return null;

    const sum = this._payersValue().reduce((acc, payer) => {
      const type = payer.type;
      if (type === PayerAmountType.Remaining) return acc;
      const amount = payer.amount ?? 0;
      return acc + amount;
    }, 0);
    return total - sum;
  });
  readonly remainingAmountFinal = computed(() => {
    const total = this.totalAmount();
    if (total === null || total === undefined) return null;

    const sum = this._payersValue().reduce((acc, payer) => {
      const type = payer.type;
      if (type === PayerAmountType.Remaining) return total;
      const amount = payer.amount ?? 0;
      return acc + amount;
    }, 0);
    return Math.max(0, total - sum);
  });
  readonly areAllAmountFieldsFilled = computed(() =>
    this._payersValue().every(payer => payer.type === PayerAmountType.Remaining || payer.amount !== null),
  );

  private _onChange: (value: PayerValue[]) => void = () => {};
  private _onTouched: () => void = () => {};

  private _isWritingValue = false;
  private readonly _subs = new Subscription();
  private readonly _typeSubs = new Map<FormGroup<WrapInAbstractControl<PayerFormValue>>, Subscription>();

  constructor() {
    this._subs.add(
      this.payers.valueChanges.subscribe(() => {
        if (this._isWritingValue) return;
        this._onChange(this._mapToOutput());
        this._onTouched();
      }),
    );
    this._subs.add(
      this.newUserIdControl.valueChanges.subscribe(userId => {
        if (userId === null || userId === undefined) return;
        this.addPayer(userId);
        this.newUserIdControl.setValue(null, { emitEvent: false });
        this._onTouched();
      }),
    );

    effect(() => {
      const shouldDisable = this.remainingUsersOptions().length === 0;
      if (shouldDisable) {
        this.newUserIdControl.disable({ emitEvent: false });
      } else {
        this.newUserIdControl.enable({ emitEvent: false });
      }
    });
  }

  addPayer(userId: number): void {
    if (this.payers.controls.some(control => control.controls.userId.getRawValue() === userId)) return;
    this.payers.push(this._createPayerGroup({ userId, amount: null }));
  }

  removePayer(index: number): void {
    const group = this.payers.at(index);
    const sub = this._typeSubs.get(group);
    if (sub) {
      sub.unsubscribe();
      this._typeSubs.delete(group);
    }
    this.payers.removeAt(index);
  }

  userName(userId: number | null): string {
    if (userId === null) return '';
    return this.userMap().get(userId)?.displayName ?? '';
  }

  writeValue(value: PayerValue[] | null): void {
    this._isWritingValue = true;
    this.payers.clear({ emitEvent: false });
    this._typeSubs.forEach(sub => sub.unsubscribe());
    this._typeSubs.clear();
    (value ?? []).forEach(payer => {
      this.payers.push(this._createPayerGroup(payer), { emitEvent: false });
    });
    this._isWritingValue = false;
  }

  registerOnChange(fn: (value: PayerValue[]) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
    this._typeSubs.forEach(sub => sub.unsubscribe());
    this._typeSubs.clear();
  }

  private _createPayerGroup(payer: PayerValue): FormGroup<WrapInAbstractControl<PayerFormValue>> {
    const userIdControl = new FormControl<number | null>(
      { value: payer.userId, disabled: true },
      { validators: [Validators.required] },
    );
    const amountControl = new FormControl<number | null>(payer.amount ?? null, {
      validators: [Validators.required, Validators.min(0)],
    });
    const shouldBeRemaining =
      payer.amount === null &&
      !this.payers.controls.some(control => control.controls.type.getRawValue() === PayerAmountType.Remaining);
    const typeControl = new FormControl<PayerAmountType>(
      shouldBeRemaining ? PayerAmountType.Remaining : PayerAmountType.Amount,
      {
        nonNullable: true,
      },
    );

    const group = new FormGroup<WrapInAbstractControl<PayerFormValue>>({
      userId: userIdControl,
      type: typeControl,
      amount: amountControl,
    });

    this._typeSubs.set(
      group,
      typeControl.valueChanges.subscribe(type => this._onTypeChange(group, type)),
    );
    if (typeControl.value === PayerAmountType.Remaining) {
      this._onTypeChange(group, PayerAmountType.Remaining);
    }

    return group;
  }

  private _onTypeChange(group: FormGroup<WrapInAbstractControl<PayerFormValue>>, type: PayerAmountType): void {
    const amountControl = group.controls.amount;

    if (type === PayerAmountType.Remaining) {
      this.payers.controls.forEach(control => {
        if (control === group) return;
        if (control.controls.type.getRawValue() === PayerAmountType.Remaining) {
          control.controls.type.setValue(PayerAmountType.Amount, { emitEvent: false });
          control.controls.amount.setValue(null, { emitEvent: false });
          control.controls.amount.setValidators([Validators.required, Validators.min(0)]);
          control.controls.amount.updateValueAndValidity({ emitEvent: false });
        }
      });

      amountControl.setValue(null, { emitEvent: false });
      amountControl.clearValidators();
      amountControl.updateValueAndValidity({ emitEvent: false });
      return;
    }

    amountControl.setValidators([Validators.required, Validators.min(0)]);
    amountControl.updateValueAndValidity({ emitEvent: false });
  }

  private _mapToOutput(): PayerValue[] {
    return this.payers.getRawValue().map(payer => ({
      userId: payer.userId,
      amount: payer.type === PayerAmountType.Remaining ? null : payer.amount,
    }));
  }
}

type PayerValue = {
  userId: number | null;
  amount: number | null;
};

enum PayerAmountType {
  Amount = 'amount',
  Remaining = 'remaining',
}

type PayerFormValue = PayerValue & {
  type: PayerAmountType;
};
