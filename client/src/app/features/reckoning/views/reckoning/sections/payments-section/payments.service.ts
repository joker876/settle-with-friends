import { inject, Injectable, ResourceStatus, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpService } from '@common/services/http-service';
import { SnackbarController } from '@common/services/snackbar-controller.service';
import { ensureParams } from '@common/utils/resource';
import { setResourceStatusAfterLoaded } from '@common/utils/rxjs';
import { IPayment, IPaymentBasicData } from '@shared/entities/payment';
import { map } from 'rxjs';
import { ReckoningService } from '../../../../services/reckoning.service';
import { singleUser, UsersService } from '../../../../services/users.service';

@Injectable()
export class PaymentsService {
  private readonly _reckoningService = inject(ReckoningService);
  private readonly _usersService = inject(UsersService);
  private readonly _http = inject(HttpService);
  private readonly _snackbarController = inject(SnackbarController);

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

  public getPayment(id: number): IPayment | null {
    return this._payments.value().find(v => v.id === id) ?? null;
  }

  //! create
  private readonly _createPaymentStatus = signal<ResourceStatus>('idle');
  public readonly createPaymentStatus = this._createPaymentStatus.asReadonly();

  public createPayment(data: IPaymentBasicData) {
    if (this._createPaymentStatus() === 'loading') return;

    this._createPaymentStatus.set('loading');

    return new Promise<boolean>(resolve =>
      this._http
        .post<IPayment, IPaymentBasicData>(
          ['reckonings', this._reckoningService.reckoningId()!, 'payments'],
          data,
        )
        .pipe(setResourceStatusAfterLoaded(this._createPaymentStatus))
        .pipe(
          map(
            this._usersService.hydrateUsersSingle([
              singleUser<IPayment>('createdBy', 'createdByUserId'),
              singleUser<IPayment>('updatedBy', 'updatedByUserId'),
              singleUser<IPayment>('paidBy', 'paidByUserId'),
            ]),
          ),
        )
        .subscribe({
          next: payment => {
            this._snackbarController.openSuccess($localize`:@@payments.created-payment:Dodano wpłatę`);
            this._payments.update(v => [...v, payment]);
            resolve(true);
          },
          error: () => {
            this._snackbarController.openError($localize`:@@payments.created-payment-error:Nie udało się dodać wpłaty`);
            resolve(false);
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

    return new Promise<boolean>(resolve =>
      this._http
        .put<IPayment, IPaymentBasicData>(
          ['reckonings', this._reckoningService.reckoningId()!, 'payments', String(paymentId)],
          data,
        )
        .pipe(setResourceStatusAfterLoaded(this._updatePaymentStatus))
        .pipe(
          map(
            this._usersService.hydrateUsersSingle([
              singleUser<IPayment>('createdBy', 'createdByUserId'),
              singleUser<IPayment>('updatedBy', 'updatedByUserId'),
              singleUser<IPayment>('paidBy', 'paidByUserId'),
            ]),
          ),
        )
        .subscribe({
          next: payment => {
            this._snackbarController.openSuccess($localize`:@@payments.updated-payment:Zapisano wpłatę`);
            this._payments.update(v => v.map(t => (t.id !== paymentId ? t : payment)));
            resolve(true);
          },
          error: () => {
            this._snackbarController.openError(
              $localize`:@@payments.updated-payment-error:Nie udało się zapisać wpłaty`,
            );
            resolve(false);
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

    this._http
      .delete(['reckonings', this._reckoningService.reckoningId()!, 'payments', String(paymentId)])
      .pipe(setResourceStatusAfterLoaded(this._deletePaymentStatus))
      .subscribe({
        next: () => {
          this._snackbarController.openSuccess($localize`:@@payments.deleted-payment:Usunięto wpłatę`);

          this._payments.update(t => t.filter(v => v.id !== paymentId));
        },
        error: () => {
          this._snackbarController.openError($localize`:@@payments.deleted-payment-error:Nie udało się usunąć wpłaty`);
        },
      });
  }
}
