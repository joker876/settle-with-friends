import { Component, inject } from '@angular/core';
import { PaymentListComponent } from '@features/reckoning/components/payment-list/payment-list.component';
import { ReckoningService } from '@features/reckoning/services/reckoning.service';
import { UsersService } from '@features/reckoning/services/users.service';
import { IPayment } from '@shared/entities/payment';
import { PaymentListService } from './payment-list.service';

@Component({
  selector: 'app-payment-list-view',
  imports: [PaymentListComponent],
  templateUrl: './payment-list.view.html',
  styleUrl: './payment-list.view.scss',
  providers: [PaymentListService],
})
export class PaymentListView {
  readonly reckoningService = inject(ReckoningService);
  readonly paymentListService = inject(PaymentListService);
  readonly usersService = inject(UsersService);

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
