import { inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpService } from '@common/services/http-service';
import { ensureParams } from '@common/utils/resource';
import { ReckoningService } from '@features/reckoning/services/reckoning.service';
import { singleUser, UsersService } from '@features/reckoning/services/users.service';
import { IPayment } from '@shared/entities/payment';
import { map } from 'rxjs';

@Injectable()
export class RecentPaymentListService {
  private readonly _http = inject(HttpService);
  private readonly _reckoningService = inject(ReckoningService);
  private readonly _usersService = inject(UsersService);

  private readonly _payments = rxResource({
    params: () => ({ reckoningId: this._reckoningService.reckoningId() }),
    stream: ({ params }) =>
      ensureParams(
        params.reckoningId,
        this._http
          .get<IPayment[]>(['reckonings', params.reckoningId!, 'payments'])
          .pipe(
            this._usersService.waitForUsersLoaded(),
            map(
              this._usersService.hydrateUsers<IPayment>([
                singleUser<IPayment>('createdBy', 'createdByUserId'),
                singleUser<IPayment>('updatedBy', 'updatedByUserId'),
                singleUser<IPayment>('paidBy', 'paidByUserId'),
              ]),
            ),
          ),
        [],
      ),
    defaultValue: [],
  });

  public readonly payments = this._payments.asReadonly();

  appendPayment(payment: IPayment): void {
    this._payments.update(payments => [...payments, payment]);
  }
  refreshPayment(updatedPayment: IPayment): void {
    this._payments.update(payments =>
      payments.map(payment => (payment.id === updatedPayment.id ? updatedPayment : payment)),
    );
  }
  removePayment(paymentId: number): void {
    this._payments.update(payments => payments.filter(payment => payment.id !== paymentId));
  }
}
