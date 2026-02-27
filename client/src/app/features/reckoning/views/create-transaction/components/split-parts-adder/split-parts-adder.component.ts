import { Component, computed, forwardRef, inject, input, OnDestroy, OnInit, signal, viewChildren } from '@angular/core';
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
  ArdiumButtonModule,
  ArdiumDialogModule,
  ArdiumDividerModule,
  ArdiumFormFieldModule,
  ArdiumGridModule,
  ArdiumIconButtonModule,
  ArdiumInputModule,
  ArdiumNumberInputComponent,
  ArdiumNumberInputModule,
} from '@ardium-ui/ui';
import { CardComponent } from '@common/components/card/card.component';
import { MoneyComponent } from '@common/components/money/money.component';
import { MultiUserSelectorComponent } from '@common/components/multi-user-selector/multi-user-selector.component';
import { SelectComponent } from '@common/components/select/select.component';
import { StackComponent } from '@common/components/stack/stack.component';
import { ArdIconX_2 } from '@common/icons/x-2.icon';
import { DeviceService } from '@common/services/device.service';
import { WrapInAbstractControl } from '@common/utils/form-types';
import { UsersService } from '@features/reckoning/services/users.service';
import { AmountType, amountTypeOptions, createAmountTypeLabelMap } from '@features/reckoning/utils/amount-type';
import { map, startWith, Subscription, tap } from 'rxjs';

@Component({
  selector: 'app-split-parts-adder',
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
    ArdiumInputModule,
    MultiUserSelectorComponent,
    ArdiumDividerModule,
  ],
  templateUrl: './split-parts-adder.component.html',
  styleUrl: './split-parts-adder.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SplitPartsAdderComponent),
      multi: true,
    },
  ],
})
export class SplitPartsAdderComponent implements ControlValueAccessor, OnDestroy, OnInit {
  readonly deviceService = inject(DeviceService);
  private readonly _usersService = inject(UsersService);

  readonly totalAmount = input<number | null>(null);
  readonly currencyCode = input<string | null>(null);

  readonly parts = new FormArray<FormGroup<WrapInAbstractControl<SplitPartFormValue>>>([]);
  readonly newPartNameControl = new FormControl<number | null>(null);

  readonly users = this._usersService.users;
  readonly usersOptions = this._usersService.usersOptions;
  readonly userMap = this._usersService.userMap;

  readonly AmountType = AmountType;
  readonly amountTypeOptions = amountTypeOptions;
  readonly isOnlyOnePerson = computed(() => this._partsValue().length <= 1);
  readonly isNoPayers = computed(() => this._partsValue().length === 0);
  readonly showEverythingLabel = computed<boolean>(() =>
    this.deviceService.isWeb()
      ? this.isOnlyOnePerson()
      : this.isNoPayers() || (this.isOnlyOnePerson() && !!this.editedPartName()),
  );
  readonly amountTypeLabelMap = computed<Record<AmountType, string>>(() =>
    createAmountTypeLabelMap(this.showEverythingLabel()),
  );

  readonly amountFields = viewChildren<ArdiumNumberInputComponent>('amountField');

  private readonly _partsValue = toSignal(
    this.parts.valueChanges.pipe(
      startWith(this.parts.getRawValue()),
      map(() => this.parts.getRawValue() as SplitPartFormValue[]),
    ),
    { initialValue: [] as SplitPartFormValue[] },
  );

  readonly remainingAmount = computed(() => {
    const total = this.totalAmount();
    if (total === null || total === undefined) return null;
    const sum = this._partsValue().reduce((acc, v) => {
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
    return !this._partsValue().some(v => v.type === AmountType.Remaining);
  });

  private _onChange: (value: SplitPartValue[]) => void = () => {};
  private _onTouched: () => void = () => {};

  private _isWritingValue = false;
  private readonly _subs = new Subscription();
  private readonly _typeSubs = new Map<FormGroup<WrapInAbstractControl<SplitPartFormValue>>, Subscription>();

  constructor() {
    this._subs.add(
      this.parts.valueChanges.subscribe(() => {
        if (this._isWritingValue) return;
        this._onChange(this._mapToOutput());
        this._onTouched();
      }),
    );
  }

  addSplitPart(partName: string, fullValue?: SplitPartFormValue): void {
    const group = this._createSplitPartGroup({ name: partName, amount: null, userIds: [] });
    if (fullValue) {
      group.setValue(fullValue);
    }

    this.parts.push(group);
  }

  removePayer(partName: string | null): void {
    const index = this.parts.controls.findIndex(control => control.value.name === partName);
    const group = this.parts.at(index);
    const sub = this._typeSubs.get(group);
    if (sub) {
      sub.unsubscribe();
      this._typeSubs.delete(group);
    }
    this.parts.removeAt(index);
  }

  focusAmountField(index: number): void {
    setTimeout(() => {
      this.amountFields().at(index)?.focus();
    }, 0);
  }

  writeValue(value: SplitPartValue[] | null): void {
    this._isWritingValue = true;
    this.parts.clear({ emitEvent: false });
    this._typeSubs.forEach(sub => sub.unsubscribe());
    this._typeSubs.clear();
    (value ?? []).forEach(payer => {
      this.parts.push(this._createSplitPartGroup(payer), { emitEvent: false });
    });
    this._isWritingValue = false;
  }

  registerOnChange(fn: (value: SplitPartValue[]) => void): void {
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

  private _createSplitPartGroup(part: SplitPartValue): FormGroup<WrapInAbstractControl<SplitPartFormValue>> {
    const nameControl = new FormControl<string | null>(part.name, { validators: [Validators.required] });
    const amountControl = new FormControl<number | null>(part.amount ?? null, {
      validators: [Validators.required, Validators.min(0.01)],
    });
    const shouldBeRemaining =
      part.amount === null &&
      !this.parts.controls.some(control => control.controls.type.getRawValue() === AmountType.Remaining);
    const typeControl = new FormControl<AmountType>(shouldBeRemaining ? AmountType.Remaining : AmountType.Amount, {
      nonNullable: true,
    });
    const userIdsControl = new FormControl<number[]>([...part.userIds], {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1)],
    });

    const group = new FormGroup<WrapInAbstractControl<SplitPartFormValue>>({
      name: nameControl,
      type: typeControl,
      amount: amountControl,
      userIds: userIdsControl,
    });

    this._typeSubs.set(
      group,
      typeControl.valueChanges.pipe(tap(console.log)).subscribe(type => this._onTypeChange(group, type)),
    );
    if (typeControl.value === AmountType.Remaining) {
      this._onTypeChange(group, AmountType.Remaining);
    }

    return group;
  }

  private _onTypeChange(group: FormGroup<WrapInAbstractControl<SplitPartFormValue>>, type: AmountType): void {
    const amountControl = group.controls.amount;

    if (type === AmountType.Remaining) {
      // change the existing 'remaining' group
      this.parts.controls.forEach((control, i) => {
        if (control === group) return;
        if (control.controls.type.getRawValue() === AmountType.Remaining) {
          control.controls.type.setValue(AmountType.Amount, { emitEvent: false });
          control.controls.amount.setValue(null, { emitEvent: false });
        }
      });

      // reset amount field
      amountControl.setValue(null, { emitEvent: false });
      return;
    }
  }

  private _mapToOutput(): SplitPartValue[] {
    return this.parts.getRawValue().map(part => ({
      name: part.name,
      amount: part.type === AmountType.Remaining ? null : part.amount,
      userIds: [...part.userIds],
    }));
  }

  //! mobile-only
  readonly isEditDialogOpen = signal<boolean>(false);

  readonly editDialogForm = this._createSplitPartGroup({ name: null, amount: null, userIds: [] });
  readonly editDialogAmount = toSignal(this.editDialogForm.controls.amount.valueChanges, {
    initialValue: this.editDialogForm.controls.amount.value,
  });
  readonly editDialogType = toSignal(this.editDialogForm.controls.type.valueChanges, {
    initialValue: this.editDialogForm.controls.type.value,
  });
  readonly editDialogUserIds = toSignal(this.editDialogForm.controls.userIds.valueChanges, {
    initialValue: this.editDialogForm.controls.userIds.value,
  });
  readonly editedPartName = signal<string | null>(null);

  readonly sortedSplitPartsValue = computed<SplitPartFormValue[]>(() =>
    [...this._partsValue()].sort((a, b) => {
      if (a.type === AmountType.Remaining && b.type !== AmountType.Remaining) return 1;
      if (b.type === AmountType.Remaining && a.type !== AmountType.Remaining) return -1;

      return b.amount! - a.amount!;
    }),
  );

  ngOnInit(): void {
    this.editDialogForm.controls.type.addValidators((control: AbstractControl) => {
      if (!control.value || control.value === AmountType.Amount) return null;

      for (const otherControl of this.parts.controls) {
        const otherValue = otherControl.getRawValue();
        if (otherValue.name === this.editDialogForm.getRawValue().name) continue;
        if (otherValue.type === AmountType.Remaining) {
          return { amountType: { everything: this.showEverythingLabel() } };
        }
      }
      return null;
    });
  }

  clickAddSplitPart() {
    this.editDialogForm.reset();
    if (this._partsValue().some(v => v.type === AmountType.Remaining)) {
      this.editDialogForm.controls.type.setValue(AmountType.Amount);
    }
    this.isEditDialogOpen.set(true);
  }
  clickEditPayer(v: SplitPartFormValue) {
    this.isEditDialogOpen.set(true);
    this.editedPartName.set(v.name);
    // wait for options to update
    setTimeout(() => {
      this.editDialogForm.setValue(v);
    }, 0);
  }
  onClickRemoveRow(event: MouseEvent, partName: string | null) {
    event.stopPropagation();
    this.removePayer(partName);
  }
  saveSplitPart() {
    this.addSplitPart(this.editDialogForm.getRawValue().name!, this.editDialogForm.getRawValue());
  }
  onDialogClose() {
    this.editedPartName.set(null);
  }

  readonly shouldShowAmountPerPerson = computed<boolean>(
    () =>
      this.editDialogUserIds().length > 0 &&
      (this.editDialogType() === AmountType.Remaining || !!this.editDialogAmount()),
  );
  readonly amountPerPerson = computed<number>(
    () =>
      ((this.editDialogType() === AmountType.Remaining ? this.remainingAmount() : this.editDialogAmount()) ?? 0) /
      this.editDialogUserIds().length,
  );
}

type SplitPartValue = {
  name: string | null;
  amount: number | null;
  userIds: number[];
};

type SplitPartFormValue = SplitPartValue & {
  type: AmountType;
};
