import {
  Component,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  signal,
  viewChildren
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  ControlValueAccessor,
  FormArray,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ArdFormFieldControl,
  ArdiumButtonModule,
  ArdiumDialogModule,
  ArdiumFormFieldModule,
  ArdiumGridModule,
  ArdiumIconButtonModule,
  ArdiumNumberInputComponent,
  ArdiumNumberInputModule,
  trackFormControl,
} from '@ardium-ui/ui';
import { CardComponent } from '@common/components/card/card.component';
import { MoneyComponent } from '@common/components/money/money.component';
import { SelectComponent } from '@common/components/select/select.component';
import { StackComponent } from '@common/components/stack/stack.component';
import { ArdIconX_2 } from '@common/icons/x-2.icon';
import { DeviceService } from '@common/services/device.service';
import { WrapInAbstractControl } from '@common/utils/form-types';
import { UsersService } from '@features/reckoning/services/users.service';
import { AmountType, amountTypeOptions, createAmountTypeLabelMap } from '@features/reckoning/utils/amount-type';
import { map, startWith, Subscription } from 'rxjs';
import TakeChance from 'take-chance';

@Component({
  selector: 'app-payers-adder',
  imports: [
    ReactiveFormsModule,
    ArdiumFormFieldModule,
    ArdiumNumberInputModule,
    ArdiumIconButtonModule,
    SelectComponent,
    ArdiumGridModule,
    CardComponent,
    ArdiumButtonModule,
    ArdiumDialogModule,
    StackComponent,
    ArdIconX_2,
    MoneyComponent,
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
export class PayersAdderComponent implements ControlValueAccessor, ArdFormFieldControl, OnDestroy, OnInit {
  readonly deviceService = inject(DeviceService);
  private readonly _usersService = inject(UsersService);

  readonly totalAmount = input<number | null>(null);
  readonly currencyCode = input<string | null>(null);

  readonly payers = new FormArray<FormGroup<WrapInAbstractControl<PayerFormValue>>>([]);
  readonly newUserIdControl = new FormControl<number | null>(null);

  readonly usersOptions = this._usersService.usersOptions;
  readonly userMap = this._usersService.userMap;

  readonly AmountType = AmountType;
  readonly amountTypeOptions = amountTypeOptions;
  readonly isOnlyOnePerson = computed(() => this._payersValue().length <= 1);
  readonly isNoPayers = computed(() => this._payersValue().length === 0);
  readonly showEverythingLabel = computed<boolean>(() =>
    this.deviceService.isWeb()
      ? this.isOnlyOnePerson()
      : this.isNoPayers() || (this.isOnlyOnePerson() && !!this.editedUserId()),
  );
  readonly amountTypeLabelMap = computed<Record<AmountType, string>>(() =>
    createAmountTypeLabelMap(this.showEverythingLabel()),
  );

  readonly amountFields = viewChildren<ArdiumNumberInputComponent>('amountField');

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
    const sum = this._payersValue().reduce((acc, v) => {
      const type = v.type;
      if (type === AmountType.Remaining) return acc;
      const amount = v.amount ?? 0;
      return acc + amount;
    }, 0);
    return total - sum;
  });
  readonly hasUnassignedRemainingAmount = computed<boolean>(() => {
    const remaining = this.remainingAmount();
    if (remaining === null || remaining === 0) return false;
    return !this._payersValue().some(v => v.type === AmountType.Remaining);
  });
  readonly hasFilledAllAmountsAndNoUsersLeft = computed<boolean>(() => {
    return (
      this.remainingUsersOptions().length === 0 &&
      this._payersValue().every(v => v.type === AmountType.Remaining || v.amount !== null)
    );
  });

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

  addPayer(userId: number, fullValue?: PayerFormValue): void {
    if (this.payers.controls.some(control => control.controls.userId.getRawValue() === userId)) return;

    const group = this._createPayerGroup({ userId, amount: null });
    if (fullValue) {
      group.setValue(fullValue);
    }

    this.payers.push(group);
  }

  removePayer(payerId: number | null): void {
    const index = this.payers.controls.findIndex(control => control.value.userId === payerId);
    const group = this.payers.at(index);
    const sub = this._typeSubs.get(group);
    if (sub) {
      sub.unsubscribe();
      this._typeSubs.delete(group);
    }
    this.payers.removeAt(index);
  }

  focusAmountField(index: number): void {
    setTimeout(() => {
      this.amountFields().at(index)?.focus();
    }, 0);
  }

  userName(userId: number | null): string {
    if (userId === null) return '';
    return this.userMap().get(userId)?.displayName ?? '';
  }

  //! ard form field control
  readonly control = trackFormControl(this);

  readonly hasError = computed(() => this.control.invalid() && this.control.touched());
  readonly disabled = this.control.disabled;
  readonly htmlId = TakeChance.id();

  //! control value accessor
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

  //! private methods
  private _createPayerGroup(
    payer: PayerValue,
    fullForm: boolean = false,
  ): FormGroup<WrapInAbstractControl<PayerFormValue>> {
    const userIdControl = new FormControl<number | null>(
      { value: payer.userId, disabled: !fullForm },
      { validators: [Validators.required] },
    );
    const amountControl = new FormControl<number | null>(payer.amount ?? null, {
      validators: [Validators.required, Validators.min(0.01)],
    });
    const shouldBeRemaining =
      payer.amount === null &&
      !this.payers.controls.some(control => control.controls.type.getRawValue() === AmountType.Remaining);
    const typeControl = new FormControl<AmountType>(shouldBeRemaining ? AmountType.Remaining : AmountType.Amount, {
      nonNullable: true,
    });

    const group = new FormGroup<WrapInAbstractControl<PayerFormValue>>({
      userId: userIdControl,
      type: typeControl,
      amount: amountControl,
    });

    this._typeSubs.set(
      group,
      typeControl.valueChanges.subscribe(type => this._onTypeChange(group, type)),
    );
    if (typeControl.value === AmountType.Remaining) {
      this._onTypeChange(group, AmountType.Remaining);
    }

    return group;
  }

  private _onTypeChange(group: FormGroup<WrapInAbstractControl<PayerFormValue>>, type: AmountType): void {
    const amountControl = group.controls.amount;

    if (type === AmountType.Remaining) {
      this.payers.controls.forEach(control => {
        if (control === group) return;
        if (control.controls.type.getRawValue() === AmountType.Remaining) {
          control.controls.type.setValue(AmountType.Amount, { emitEvent: false });
          control.controls.amount.setValue(null, { emitEvent: false });
          control.controls.amount.setValidators([Validators.required, Validators.min(0.01)]);
          control.controls.amount.updateValueAndValidity({ emitEvent: false });
        }
      });

      amountControl.setValue(null, { emitEvent: false });
      amountControl.clearValidators();
      amountControl.updateValueAndValidity({ emitEvent: false });
      return;
    }

    amountControl.setValidators([Validators.required, Validators.min(0.01)]);
    amountControl.updateValueAndValidity({ emitEvent: false });
  }

  private _mapToOutput(): PayerValue[] {
    return this.payers.getRawValue().map(payer => ({
      userId: payer.userId,
      amount: payer.type === AmountType.Remaining ? null : payer.amount,
    }));
  }

  //! mobile-only
  readonly isEditDialogOpen = signal<boolean>(false);

  readonly editDialogForm = this._createPayerGroup({ userId: null, amount: null }, true);
  readonly editedUserId = signal<number | null>(null);

  readonly remainingUsersOptionsWithEditedUser = computed(() => {
    const usedIds = new Set(this._payersValue().map(payer => payer.userId));
    return this.usersOptions().filter(option => !usedIds.has(option.value) || this.editedUserId() === option.value);
  });

  readonly sortedPayerValue = computed<PayerFormValue[]>(() =>
    [...this._payersValue()].sort((a, b) => {
      if (a.type === AmountType.Remaining && b.type !== AmountType.Remaining) return 1;
      if (b.type === AmountType.Remaining && a.type !== AmountType.Remaining) return -1;

      return b.amount! - a.amount!;
    }),
  );

  ngOnInit(): void {
    this.editDialogForm.controls.type.addValidators((control: AbstractControl) => {
      if (!control.value || control.value === AmountType.Amount) return null;

      for (const otherControl of this.payers.controls) {
        const otherValue = otherControl.getRawValue();
        if (otherValue.userId === this.editDialogForm.getRawValue().userId) continue;
        if (otherValue.type === AmountType.Remaining) {
          return { amountType: { everything: this.showEverythingLabel() } };
        }
      }
      return null;
    });
  }

  clickAddPayer() {
    this.editDialogForm.reset();
    if (this.remainingUsersOptionsWithEditedUser().length === 1) {
      this.editDialogForm.controls.userId.setValue(this.remainingUsersOptionsWithEditedUser()[0].value);
    }
    if (this._payersValue().some(v => v.type === AmountType.Remaining)) {
      this.editDialogForm.controls.type.setValue(AmountType.Amount);
    }
    this.isEditDialogOpen.set(true);
  }
  clickEditPayer(v: PayerFormValue) {
    this.isEditDialogOpen.set(true);
    this.editedUserId.set(v.userId);
    // wait for options to update
    setTimeout(() => {
      this.editDialogForm.setValue(v);
    }, 0);
  }
  onClickRemoveRow(event: MouseEvent, userId: number | null) {
    event.stopPropagation();
    this.removePayer(userId);
  }
  savePayer() {
    this.addPayer(this.editDialogForm.getRawValue().userId!, this.editDialogForm.getRawValue());
  }
  onDialogClose() {
    this.editedUserId.set(null);
  }
}

type PayerValue = {
  userId: number | null;
  amount: number | null;
};

type PayerFormValue = PayerValue & {
  type: AmountType;
};
