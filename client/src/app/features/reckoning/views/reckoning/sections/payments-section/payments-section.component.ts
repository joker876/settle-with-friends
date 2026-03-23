import { Component, computed, inject, input, signal } from '@angular/core';
import { ArdiumButtonModule, ArdiumDialogModule, ArdiumIconButtonModule } from '@ardium-ui/ui';
import { ConfirmationDialogComponent } from '@common/components/confirmation-dialog/confirmation-dialog.component';
import { MoneyComponent } from '@common/components/money/money.component';
import { SectionHeadingComponent } from '@common/components/section-heading/section-heading.component';
import { ArdIconPlus } from '@common/icons/plus.icon';
import { IPayment, IPaymentBasicData } from '@shared/entities/payment';
import { PaymentCreateEditDialogComponent } from './components/payment-create-edit-dialog/payment-create-edit-dialog.component';
import { PaymentListItemComponent } from './components/payment-list-item/payment-list-item.component';
import { PaymentsService } from './payments.service';

@Component({
  selector: 'app-payments-section',
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
  templateUrl: './payments-section.component.html',
  styleUrl: './payments-section.component.scss',
})
export class PaymentsSectionComponent {
  private readonly _paymentsService = inject(PaymentsService);

  readonly mainCurrency = input.required<string>();

  readonly payments = this._paymentsService.payments;

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
      success = await this._paymentsService.createPayment(formData)!;
    } else {
      const oldData = this.createEditDialogPaymentData()!;
      // only send update request if data has changed
      if (
        Object.entries(formData).some(
          ([key, value]) => value?.valueOf() !== oldData[key as keyof IPaymentBasicData]?.valueOf(),
        )
      ) {
        success = await this._paymentsService.updatePayment(this.createEditDialogPaymentData()!.id, formData)!;
      } else {
        success = true; // close dialog if no changes were made
      }
    }
    if (success) {
      this.isCreateEditDialogOpen.set(false);
    }
  }

  //! deleting
  readonly paymentToBeDeleted = signal<IPayment | null>(null);

  readonly isDeleteLoading = computed(() => this._paymentsService.deletePaymentStatus() === 'loading');

  onDeletePaymentClick(t: IPayment): void {
    this.paymentToBeDeleted.set(t);
  }
  deletePayment(): void {
    const payment = this.paymentToBeDeleted();
    if (!payment) return;

    this._paymentsService.deletePayment(payment.id);
  }
}
