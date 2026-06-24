import { inject, Injectable, ResourceStatus, signal } from '@angular/core';
import { HttpService } from '@common/services/http-service';
import { SnackbarController } from '@common/services/snackbar-controller.service';
import { setResourceStatusAfterLoaded } from '@common/utils/rxjs';
import { ReckoningService } from '@features/reckoning/services/reckoning.service';
import { UsersService } from '@features/reckoning/services/users.service';
import { hydratePayment } from '@features/reckoning/utils/hydration/payment';
import { IPayment, IPaymentBasicData } from '@shared/entities/payment';

@Injectable()
export class PaymentsService {
  private readonly _reckoningService = inject(ReckoningService);
  private readonly _usersService = inject(UsersService);
  private readonly _http = inject(HttpService);
  private readonly _snackbarController = inject(SnackbarController);

  //! create
  private readonly _createPaymentStatus = signal<ResourceStatus>('idle');
  public readonly createPaymentStatus = this._createPaymentStatus.asReadonly();

  public createPayment(data: IPaymentBasicData) {
    if (this._createPaymentStatus() === 'loading') return;

    this._createPaymentStatus.set('loading');

    return new Promise<IPayment | null>(resolve =>
      this._http
        .post<IPayment, IPaymentBasicData>(['reckonings', this._reckoningService.reckoningId()!, 'payments'], data)
        .pipe(setResourceStatusAfterLoaded(this._createPaymentStatus), hydratePayment(this._usersService))
        .subscribe({
          next: payment => {
            this._snackbarController.openSuccess($localize`:@@payments.created-payment:Dodano wpłatę`);
            resolve(payment);
          },
          error: () => {
            this._snackbarController.openError($localize`:@@payments.created-payment-error:Nie udało się dodać wpłaty`);
            resolve(null);
          },
        }),
    );
  }

  //! update
  private readonly _updatePaymentStatus = signal<ResourceStatus>('idle');
  public readonly updatePaymentStatus = this._updatePaymentStatus.asReadonly();

  public updatePayment(paymentId: number, data: IPaymentBasicData) {
    if (this._updatePaymentStatus() === 'loading') return;

    this._updatePaymentStatus.set('loading');

    return new Promise<IPayment | null>(resolve =>
      this._http
        .put<IPayment, IPaymentBasicData>(
          ['reckonings', this._reckoningService.reckoningId()!, 'payments', String(paymentId)],
          data,
        )
        .pipe(setResourceStatusAfterLoaded(this._updatePaymentStatus), hydratePayment(this._usersService))
        .subscribe({
          next: payment => {
            this._snackbarController.openSuccess($localize`:@@payments.updated-payment:Zapisano wpłatę`);
            resolve(payment);
          },
          error: () => {
            this._snackbarController.openError(
              $localize`:@@payments.updated-payment-error:Nie udało się zapisać wpłaty`,
            );
            resolve(null);
          },
        }),
    );
  }

  //! delete
  private readonly _deletePaymentStatus = signal<ResourceStatus>('idle');
  public readonly deletePaymentStatus = this._deletePaymentStatus.asReadonly();

  public deletePayment(paymentId: number) {
    if (this._deletePaymentStatus() === 'loading') return;

    this._deletePaymentStatus.set('loading');

    return new Promise<boolean>(resolve =>
      this._http
        .delete(['reckonings', this._reckoningService.reckoningId()!, 'payments', String(paymentId)])
        .pipe(setResourceStatusAfterLoaded(this._deletePaymentStatus))
        .subscribe({
          next: () => {
            this._snackbarController.openSuccess($localize`:@@payments.deleted-payment:Usunięto wpłatę`);
            resolve(true);
          },
          error: () => {
            this._snackbarController.openError(
              $localize`:@@payments.deleted-payment-error:Nie udało się usunąć wpłaty`,
            );
            resolve(false);
          },
        }),
    );
  }
}
