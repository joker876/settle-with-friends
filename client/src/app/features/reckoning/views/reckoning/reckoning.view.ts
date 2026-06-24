import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReckoningService } from '@features/reckoning/services/reckoning.service';
import { UsersService } from '@features/reckoning/services/users.service';
import { IPayment } from '@shared/entities/payment';
import { PaymentListComponent } from '../../components/payment-list/payment-list.component';
import { TransactionListComponent } from '../../components/transaction-list/transaction-list.component';
import { RecentPaymentListService } from './recent-payment-list.service';
import { RecentTransactionListService } from './recent-transaction-list.service';

@Component({
  selector: 'app-reckoning-view',
  imports: [TransactionListComponent, PaymentListComponent],
  templateUrl: './reckoning.view.html',
  styleUrl: './reckoning.view.scss',
  providers: [RecentTransactionListService, RecentPaymentListService],
})
export class ReckoningView {
  readonly reckoningService = inject(ReckoningService);
  readonly transactionListService = inject(RecentTransactionListService);
  readonly paymentListService = inject(RecentPaymentListService);
  readonly usersService = inject(UsersService);
  private readonly _router = inject(Router);
  private readonly _activatedRoute = inject(ActivatedRoute);

  navigateToTransactions() {
    this._router.navigate(['transactions'], { relativeTo: this._activatedRoute });
  }
  navigateToPayments() {
    this._router.navigate(['payments'], { relativeTo: this._activatedRoute });
  }

  navigateToCreateTransaction() {
    this._router.navigate(['create-transaction'], { relativeTo: this._activatedRoute });
  }
  navigateToEditTransaction(transactionId: number) {
    this._router.navigate(['transaction', transactionId], { relativeTo: this._activatedRoute });
  }
  removeTransaction(transactionId: number) {
    this.transactionListService.removeTransaction(transactionId);
  }

  appendPayment(payment: IPayment) {
    this.paymentListService.appendPayment(payment);
  }
  refreshPayment(payment: IPayment) {
    this.paymentListService.refreshPayment(payment);
  }
  removePayment(paymentId: number) {
    this.paymentListService.removePayment(paymentId);
  }
}
