import { Component, computed, forwardRef, inject, input, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
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
import { trackBoundControl } from '@ardium-ui/devkit';
import { ArdIconUser_2, ArdIconX_2 } from '@ardium-ui/icons';
import {
  ARD_FORM_FIELD_CONTROL,
  ArdFormFieldControl,
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
import { PluralComponent } from '@common/components/plural/plural.component';
import { SelectComponent } from '@common/components/select/select.component';
import { StackComponent } from '@common/components/stack/stack.component';
import { StatisticWithIconComponent } from '@common/components/statistic-with-icon/statistic-with-icon.component';
import { WrapInAbstractControl } from '@common/utils/form-types';
import { UsersService } from '@features/reckoning/services/users.service';
import { AmountType, amountTypeOptions, createAmountTypeLabelMap } from '@features/reckoning/utils/amount-type';
import { ICreateTransactionRequestSplitPartDto } from '@shared/contracts/transactions/create';
import { IUpdateTransactionRequestSplitPartDto } from '@shared/contracts/transactions/update';
import { map, startWith, Subscription, tap } from 'rxjs';
import TakeChance from 'take-chance';

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
    StatisticWithIconComponent,
    ArdIconUser_2,
    PluralComponent,
  ],
  templateUrl: './split-parts-adder.component.html',
  styleUrl: './split-parts-adder.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SplitPartsAdderComponent),
      multi: true,
    },
    {
      provide: ARD_FORM_FIELD_CONTROL,
      useExisting: forwardRef(() => SplitPartsAdderComponent),
    },
  ],
})
export class SplitPartsAdderComponent implements ControlValueAccessor, ArdFormFieldControl, OnDestroy, OnInit {
  private readonly _usersService = inject(UsersService);

  readonly totalAmount = input<number | null>(null);
  readonly currencyCode = input<string | null>(null);

  readonly parts = new FormArray<FormGroup<WrapInAbstractControl<SplitPartFormValue>>>([]);

  readonly users = this._usersService.users;
  readonly usersOptions = this._usersService.usersOptions;
  readonly userMap = this._usersService.userMap;

  mapUserIdsToUserNames(ids: number[]): string[] {
    return ids.map(v => this.userMap().get(v)!.displayName);
  }

  readonly AmountType = AmountType;
  readonly amountTypeOptions = amountTypeOptions;
  readonly isOnlyOnePerson = computed(() => this._partsValue().length <= 1);
  readonly isNoPayers = computed(() => this._partsValue().length === 0);
  readonly showEverythingLabel = computed<boolean>(
    () => this.isNoPayers() || (this.isOnlyOnePerson() && !!this.editedPartName()),
  );
  readonly amountTypeLabelMap = computed<Record<AmountType, string>>(() =>
    createAmountTypeLabelMap(this.showEverythingLabel()),
  );

  private readonly _partsValue = toSignal(
    this.parts.valueChanges.pipe(
      startWith(this.parts.getRawValue()),
      map(() => this.parts.getRawValue() as SplitPartFormValue[]),
    ),
    { initialValue: [] as SplitPartFormValue[] },
  );
  readonly sortedSplitPartsValue = computed<SplitPartFormValue[]>(() =>
    [...this._partsValue()].sort((a, b) => {
      if (a.type === AmountType.Remaining && b.type !== AmountType.Remaining) return 1;
      if (b.type === AmountType.Remaining && a.type !== AmountType.Remaining) return -1;

      return b.amount! - a.amount!;
    }),
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

  addSplitPart(fullValue: SplitPartFormValue): void {
    const group = this._createSplitPartGroup(fullValue);
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

  readonly amountField = viewChild<ArdiumNumberInputComponent>('amountField');
  focusAmountField(): void {
    setTimeout(() => {
      this.amountField()?.focus();
    }, 0);
  }

  //! ard form field control
  readonly control = trackBoundControl(this);

  readonly hasError = computed(() => this.control.invalid() && this.control.touched());
  readonly disabled = this.control.disabled;
  readonly htmlId = TakeChance.id();

  //! control value accessor
  private _isWritingValue = false;
  writeValue(value: ICreateTransactionRequestSplitPartDto[] | null): void {
    this._isWritingValue = true;
    this.parts.clear({ emitEvent: false });
    this._typeSubs.forEach(sub => sub.unsubscribe());
    this._typeSubs.clear();
    (value ?? []).forEach(payer => {
      this.parts.push(this._createSplitPartGroup(payer));
    });
    this._isWritingValue = false;
  }

  private _onChange: (value: ICreateTransactionRequestSplitPartDto[]) => void = () => {};
  private _onTouched: () => void = () => {};

  registerOnChange(fn: (value: ICreateTransactionRequestSplitPartDto[]) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
    this._typeSubs.forEach(sub => sub.unsubscribe());
    this._typeSubs.clear();

    this.control.destroy();
  }

  //! private methods
  private _createSplitPartGroup(
    part: IUpdateTransactionRequestSplitPartDto | ICreateTransactionRequestSplitPartDto,
  ): FormGroup<WrapInAbstractControl<SplitPartFormValue>> {
    const nameControl = new FormControl<string>(part.name, { nonNullable: true, validators: [Validators.required] });
    const shouldBeRemaining =
      part.amount === null &&
      !this.parts.controls.some(control => control.controls.type.getRawValue() === AmountType.Remaining);
    const typeControl = new FormControl<AmountType>(shouldBeRemaining ? AmountType.Remaining : AmountType.Amount, {
      nonNullable: true,
    });
    const amountControl = new FormControl<number | null>(
      { value: part.amount ?? null, disabled: shouldBeRemaining },
      {
        validators: [Validators.required, Validators.min(0.01)],
      },
    );
    const includeesControl = new FormControl<number[]>([...part.includees], {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1)],
    });
    const partId = 'id' in part ? part.id : -1;

    const group = new FormGroup<WrapInAbstractControl<SplitPartFormValue>>({
      id: new FormControl<number>(partId, { nonNullable: true }),
      name: nameControl,
      type: typeControl,
      amount: amountControl,
      includees: includeesControl,
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

  private _mapToOutput(): ICreateTransactionRequestSplitPartDto[] {
    return this.parts.getRawValue().map(part => ({
      id: part.id,
      name: part.name,
      amount: part.type === AmountType.Remaining ? null : part.amount,
      includees: [...part.includees],
    }));
  }

  //! edit form
  readonly isEditDialogOpen = signal<boolean>(false);

  readonly editDialogForm = this._createSplitPartGroup({ name: '', amount: null, includees: [] });
  readonly editDialogAmount = toSignal(this.editDialogForm.controls.amount.valueChanges, {
    initialValue: this.editDialogForm.controls.amount.value,
  });
  readonly editDialogType = toSignal(this.editDialogForm.controls.type.valueChanges, {
    initialValue: this.editDialogForm.controls.type.value,
  });
  readonly editDialogIncludees = toSignal(this.editDialogForm.controls.includees.valueChanges, {
    initialValue: this.editDialogForm.controls.includees.value,
  });
  readonly editedPartName = signal<string | null>(null);

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

    this.control.init();
  }

  clickAddSplitPart() {
    this.editDialogForm.reset();
    if (this._partsValue().some(v => v.type === AmountType.Remaining)) {
      this.editDialogForm.controls.type.setValue(AmountType.Amount);
      this.onAmountTypeChange(AmountType.Amount);
    }
    this.isEditDialogOpen.set(true);
  }
  clickAddEveryone() {
    this.addSplitPart({
      id: -1,
      name: $localize`:@@create-transaction.split-parts.transaction-everyone:Po równo`,
      type: AmountType.Remaining,
      amount: null,
      includees: this.users.value().map(v => v.id),
    });
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
    this.addSplitPart(this.editDialogForm.getRawValue());
  }
  onDialogClose() {
    this.editedPartName.set(null);
  }

  onAmountTypeChange(currentType: AmountType): void {
    if (currentType === AmountType.Remaining) {
      this.editDialogForm.controls.amount.disable();
    } else {
      this.editDialogForm.controls.amount.enable();
    }
  }

  readonly shouldShowAmountPerPerson = computed<boolean>(
    () =>
      this.editDialogIncludees().length > 1 &&
      (this.editDialogType() === AmountType.Remaining || !!this.editDialogAmount()),
  );
  readonly amountPerPerson = computed<number>(
    () =>
      ((this.editDialogType() === AmountType.Remaining ? this.remainingAmount() : this.editDialogAmount()) ?? 0) /
      this.editDialogIncludees().length,
  );
}

type SplitPartFormValue = IUpdateTransactionRequestSplitPartDto & {
  type: AmountType;
};
