import { Component, computed, inject, input, output, signal } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BooleanLike, coerceBooleanProperty } from '@ardium-ui/devkit';
import { ArdIconPlus } from '@ardium-ui/icons';
import { ArdiumButtonModule, ArdiumDialogModule, ArdiumIconButtonModule } from '@ardium-ui/ui';
import { ConfirmationDialogComponent } from '@common/components/confirmation-dialog/confirmation-dialog.component';
import { MoneyComponent } from '@common/components/money/money.component';
import { SectionHeadingComponent } from '@common/components/section-heading/section-heading.component';
import { CurrencyRatesService } from '@features/reckoning/services/currency-rates.service';
import { IReturn, IReturnBasicData } from '@shared/entities/return';
import { ReturnCreateEditDialogComponent } from './return-create-edit-dialog/return-create-edit-dialog.component';
import { ReturnListItemComponent } from './return-list-item/return-list-item.component';
import { ReturnsService } from './returns.service';

@Component({
  selector: 'app-return-list',
  imports: [
    ArdiumIconButtonModule,
    ReturnListItemComponent,
    SectionHeadingComponent,
    ArdiumButtonModule,
    ArdIconPlus,
    ConfirmationDialogComponent,
    MoneyComponent,
    ArdiumDialogModule,
    ReturnCreateEditDialogComponent,
    MatTooltipModule,
  ],
  templateUrl: './return-list.component.html',
  styleUrl: './return-list.component.scss',
})
export class ReturnListComponent {
  private readonly _returnsService = inject(ReturnsService);
  private readonly _currencyRatesService = inject(CurrencyRatesService);

  readonly returns = input.required<IReturn[]>();
  readonly isArchived = input.required<boolean>();
  readonly partialList = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });

  readonly showAllButtonClick = output<void>();
  readonly appendReturn = output<IReturn>();
  readonly refreshReturn = output<IReturn>();
  readonly removeReturn = output<number>();

  readonly mainCurrency = this._currencyRatesService.mainCurrency;

  //! creating/editing
  readonly isCreateEditDialogOpen = signal<boolean>(false);
  readonly createEditDialogReturnData = signal<IReturn | null>(null);

  readonly isCreatingReturn = computed<boolean>(() => this.createEditDialogReturnData() === null);

  readonly isCreateEditDialogSubmitting = computed(() => {
    return (
      this._returnsService.createReturnStatus() === 'loading' || this._returnsService.updateReturnStatus() === 'loading'
    );
  });

  onCreateReturnClick(): void {
    if (this.isArchived()) return;
    this.isCreateEditDialogOpen.set(true);
    this.createEditDialogReturnData.set(null);
  }

  onEditReturnClick(rtn: IReturn): void {
    if (this.isArchived()) return;
    this.isCreateEditDialogOpen.set(true);
    this.createEditDialogReturnData.set(rtn);
  }

  async onSubmitCreateEditDialog(formData: IReturnBasicData): Promise<void> {
    let success = false;
    if (this.isCreatingReturn()) {
      success = await this._createReturn(formData);
    } else {
      const oldData = this.createEditDialogReturnData()!;
      // only send update request if data has changed
      if (
        Object.entries(formData).some(
          ([key, value]) => value?.valueOf() !== oldData[key as keyof IReturnBasicData]?.valueOf(),
        )
      ) {
        success = await this._updateReturn(oldData.id, formData);
      } else {
        success = true; // close dialog if no changes were made
      }
    }
    if (success) {
      this.isCreateEditDialogOpen.set(false);
    }
  }
  private _createReturn(formData: IReturnBasicData): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this._returnsService.createReturn(formData)!.then(rtn => {
        if (rtn) {
          this.appendReturn.emit(rtn);
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }
  private _updateReturn(returnId: number, formData: IReturnBasicData): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this._returnsService.updateReturn(returnId, formData)!.then(updatedReturn => {
        if (updatedReturn) {
          this.refreshReturn.emit(updatedReturn);
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  //! deleting
  readonly returnToBeDeleted = signal<IReturn | null>(null);

  readonly isDeleteLoading = computed(() => this._returnsService.deleteReturnStatus() === 'loading');

  onDeleteReturnClick(rtn: IReturn): void {
    if (this.isArchived()) return;
    this.returnToBeDeleted.set(rtn);
  }
  async deleteReturn(): Promise<void> {
    const rtn = this.returnToBeDeleted();
    if (!rtn) return;

    const success = await this._returnsService.deleteReturn(rtn.id);
    if (success) {
      this.removeReturn.emit(rtn.id);
      this.returnToBeDeleted.set(null);
    }
  }
}
