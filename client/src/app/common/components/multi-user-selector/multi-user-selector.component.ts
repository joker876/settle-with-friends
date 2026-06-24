import { Component, computed, inject, input, OnDestroy, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { trackBoundControl } from '@ardium-ui/devkit';
import {
  ARD_FORM_FIELD_CONTROL,
  ArdFormFieldControl,
  ArdiumButtonModule,
  ArdiumCheckboxListModule,
  ArdiumCheckboxModule,
  ArdiumDialogModule,
  ArdiumIconButtonModule,
  ArdiumSelectModule,
} from '@ardium-ui/ui';
import { ArdIconCheckboxEmpty } from '@common/icons/checkbox-empty.icon';
import { ArdIconCheckboxFilled } from '@common/icons/checkbox.icon copy';
import { ArdIconEditLine_2 } from "@common/icons/edit-line-2.icon";
import { DeviceService } from '@common/services/device.service';
import { mapResourceToIdMap } from '@common/utils/resource-mappers';
import { IUserPublicData } from '@shared/entities/user';
import { isEqual } from 'lodash';
import TakeChance from 'take-chance';
import { AvatarListComponent } from '../avatar-list/avatar-list.component';
import { PluralComponent } from "../plural/plural.component";

@Component({
  selector: 'app-multi-user-selector',
  imports: [
    ArdiumSelectModule,
    ReactiveFormsModule,
    AvatarListComponent,
    ArdiumIconButtonModule,
    ArdiumDialogModule,
    ArdiumCheckboxListModule,
    ArdIconCheckboxFilled,
    ArdIconCheckboxEmpty,
    ArdiumButtonModule,
    ArdiumCheckboxModule,
    PluralComponent,
    ArdIconEditLine_2
],
  templateUrl: './multi-user-selector.component.html',
  styleUrl: './multi-user-selector.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [
    { provide: ARD_FORM_FIELD_CONTROL, useExisting: MultiUserSelectorComponent },
    { provide: NG_VALUE_ACCESSOR, useExisting: MultiUserSelectorComponent, multi: true },
  ],
})
export class MultiUserSelectorComponent implements ArdFormFieldControl, ControlValueAccessor, OnInit, OnDestroy {
  readonly deviceService = inject(DeviceService);

  readonly users = input.required<IUserPublicData[]>();
  readonly usersMap = mapResourceToIdMap(this.users);

  readonly value = signal<IUserPublicData[]>([], { equal: isEqual });
  readonly valueAsIdList = computed<number[]>(() => this.value().map(v => v.id));

  //! editor dialog
  readonly isDialogOpen = signal<boolean>(false);

  readonly dialogValue = signal<number[]>([]);

  openDialog() {
    this.isDialogOpen.set(true);
    this.dialogValue.set(this.valueAsIdList());
  }
  onDialogClose() {
    this.isDialogOpen.set(false);
    this._onTouched();
  }
  saveSelected() {
    this.value.set(
      this.dialogValue()
        .map(id => this.usersMap().get(id))
        .filter(v => !!v),
    );
    this._emitChange();
  }

  readonly isAllSelected = computed<boolean>(() => this.dialogValue().length === this.users().length);

  selectAll() {
    this.dialogValue.set(this.users().map(v => v.id));
  }
  unselectAll() {
    this.dialogValue.set([]);
  }

  //! ard form field control
  readonly control = trackBoundControl(this);

  readonly hasError = computed(() => this.control.touched() && this.control.invalid());
  readonly disabled = this.control.disabled;
  readonly htmlId = TakeChance.id();

  ngOnInit(): void {
    this.control.init();
  }
  ngOnDestroy(): void {
    this.control.destroy();
  }

  //! control value accessor
  writeValue(userIds: number[] | null) {
    if (!userIds) this.value.set([]);

    const userIdsSet = new Set(userIds);
    const users = this.users().filter(user => userIdsSet.has(user.id));
    this.value.set(users);
  }

  private _onChange: (value: number[]) => void = () => {};
  private _onTouched: () => void = () => {};

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  private _emitChange() {
    this._onChange(this.valueAsIdList());
  }
}
