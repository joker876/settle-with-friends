import { Component, computed, inject, input, output, signal } from '@angular/core';
import { BooleanLike, coerceBooleanProperty } from '@ardium-ui/devkit';
import { ArdiumButtonModule, ArdiumDialogModule, ArdiumIconButtonModule } from '@ardium-ui/ui';
import { ConfirmationDialogComponent } from '@common/components/confirmation-dialog/confirmation-dialog.component';
import { MoneyComponent } from '@common/components/money/money.component';
import { SectionHeadingComponent } from '@common/components/section-heading/section-heading.component';
import { ArdIconPlus } from '@common/icons/plus.icon';
import { CurrencyRatesService } from '@features/reckoning/services/currency-rates.service';
import { IPayment, IPaymentBasicData } from '@shared/entities/payment';
import { PaymentCreateEditDialogComponent } from './payment-create-edit-dialog/payment-create-edit-dialog.component';
import { PaymentListItemComponent } from './payment-list-item/payment-list-item.component';
import { PaymentsService } from './payments.service';

@Component({
  selector: 'app-payment-list',
  imports: [
    ArdiumIconButtonModule,
    PaymentListItemComponent,
    SectionHeadingComponent,
    ArdiumButtonModule,
    ArdIconPlus,
    ConfirmationDialogComponent,
    MoneyComponent,
    ArdiumDialogModule,
    PaymentCreateEditDialogComponent,
  ],
  templateUrl: './payment-list.component.html',
  styleUrl: './payment-list.component.scss',
})
export class PaymentListComponent {
  private readonly _paymentsService = inject(PaymentsService);
  private readonly _currencyRatesService = inject(CurrencyRatesService);

  readonly payments = input.required<IPayment[]>();
  readonly partialList = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });

  readonly showAllButtonClick = output<void>();
  readonly appendPayment = output<IPayment>();
  readonly refreshPayment = output<IPayment>();
  readonly removePayment = output<number>();

  readonly mainCurrency = this._currencyRatesService.mainCurrency;

  //! creating/editing
  readonly isCreateEditDialogOpen = signal<boolean>(false);
  readonly createEditDialogPaymentData = signal<IPayment | null>(null);

  readonly isCreatingPayment = computed<boolean>(() => this.createEditDialogPaymentData() === null);

  readonly isCreateEditDialogSubmitting = computed(() => {
    return (
      this._paymentsService.createPaymentStatus() === 'loading' ||
      this._paymentsService.updatePaymentStatus() === 'loading'
    );
  });

  onCreatePaymentClick(): void {
    this.isCreateEditDialogOpen.set(true);
    this.createEditDialogPaymentData.set(null);
  }

  onEditPaymentClick(payment: IPayment): void {
    this.isCreateEditDialogOpen.set(true);
    this.createEditDialogPaymentData.set(payment);
  }

  async onSubmitCreateEditDialog(formData: IPaymentBasicData): Promise<void> {
    let success = false;
    if (this.isCreatingPayment()) {
      success = await this._createPayment(formData);
    } else {
      const oldData = this.createEditDialogPaymentData()!;
      // only send update request if data has changed
      if (
        Object.entries(formData).some(
          ([key, value]) => value?.valueOf() !== oldData[key as keyof IPaymentBasicData]?.valueOf(),
        )
      ) {
        success = await this._updatePayment(oldData.id, formData);
      } else {
        success = true; // close dialog if no changes were made
      }
    }
    if (success) {
      this.isCreateEditDialogOpen.set(false);
    }
  }
  private _createPayment(formData: IPaymentBasicData): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this._paymentsService.createPayment(formData)!.then(payment => {
        if (payment) {
          this.appendPayment.emit(payment);
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }
  private _updatePayment(paymentId: number, formData: IPaymentBasicData): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this._paymentsService.updatePayment(paymentId, formData)!.then(updatedPayment => {
        if (updatedPayment) {
          this.refreshPayment.emit(updatedPayment);
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  //! deleting
  readonly paymentToBeDeleted = signal<IPayment | null>(null);

  readonly isDeleteLoading = computed(() => this._paymentsService.deletePaymentStatus() === 'loading');

  onDeletePaymentClick(t: IPayment): void {
    this.paymentToBeDeleted.set(t);
  }
  async deletePayment(): Promise<void> {
    const payment = this.paymentToBeDeleted();
    if (!payment) return;

    const success = await this._paymentsService.deletePayment(payment.id);
    if (success) {
      this.removePayment.emit(payment.id);
    }
  }
}
