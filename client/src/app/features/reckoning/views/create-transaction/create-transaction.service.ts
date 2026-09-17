import { inject, Injectable, ResourceStatus, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpService } from '@common/services/http-service';
import { SnackbarController } from '@common/services/snackbar-controller.service';
import { ensureParams } from '@common/utils/resource';
import { setResourceStatusAfterLoaded } from '@common/utils/rxjs';
import { ReckoningService } from '@features/reckoning/services/reckoning.service';
import { UsersService } from '@features/reckoning/services/users.service';
import { hydrateTransaction } from '@features/reckoning/utils/hydration/transaction';
import { ICreateTransactionRequestDto } from '@shared/contracts/transactions/create';
import { IUpdateTransactionRequestDto } from '@shared/contracts/transactions/update';
import { ITransaction } from '@shared/entities/transaction';
import { BasicSummaryService } from '../reckoning/basic-summary.service';

@Injectable()
export class CreateTransactionService {
  private readonly _http = inject(HttpService);
  private readonly _reckoningService = inject(ReckoningService);
  private readonly _usersService = inject(UsersService);
  private readonly _snackbarController = inject(SnackbarController);
  private readonly _summaryService = inject(BasicSummaryService);

  private readonly _transactionId = signal<number | null>(null);

  public setTransactionId(id: number | null) {
    this._transactionId.set(id);
  }

  private readonly _transactionData = rxResource({
    params: () => ({ reckoningId: this._reckoningService.reckoningId(), transactionId: this._transactionId() }),
    stream: ({ params }) =>
      ensureParams(
        !!params.reckoningId && !!params.transactionId,
        this._http
          .get<ITransaction>(['reckonings', params.reckoningId!, 'transactions', params.transactionId?.toString()!])
          .pipe(this._usersService.waitForUsersLoaded(), hydrateTransaction(this._usersService)),
        null,
      ),
    defaultValue: null,
  });
  public readonly transactionData = this._transactionData.asReadonly();

  //! create
  private readonly _createTransactionStatus = signal<ResourceStatus>('idle');
  public readonly createTransactionStatus = this._createTransactionStatus.asReadonly();

  public createTransaction(data: ICreateTransactionRequestDto) {
    if (this._createTransactionStatus() === 'loading') return;

    this._createTransactionStatus.set('loading');

    return new Promise<ITransaction | null>(resolve =>
      this._http
        .post<ITransaction, ICreateTransactionRequestDto>(
          ['reckonings', this._reckoningService.reckoningId()!, 'transactions'],
          data,
        )
        .pipe(
          setResourceStatusAfterLoaded(this._createTransactionStatus),
          this._usersService.waitForUsersLoaded(),
          hydrateTransaction(this._usersService),
        )
        .subscribe({
          next: transaction => {
            this._snackbarController.openSuccess($localize`:@@transactions.created-transaction:Dodano transakcję`);
            this._summaryService.reload({ transactions: true });
            resolve(transaction);
          },
          error: () => {
            this._snackbarController.openError(
              $localize`:@@transactions.created-transaction-error:Nie udało się dodać transakcji`,
            );
            resolve(null);
          },
        }),
    );
  }

  //! update
  private readonly _updateTransactionStatus = signal<ResourceStatus>('idle');
  public readonly updateTransactionStatus = this._updateTransactionStatus.asReadonly();

  public updateTransaction(transactionId: number, data: IUpdateTransactionRequestDto) {
    if (this._updateTransactionStatus() === 'loading') return;

    this._updateTransactionStatus.set('loading');

    return new Promise<ITransaction | null>(resolve =>
      this._http
        .put<ITransaction, IUpdateTransactionRequestDto>(
          ['reckonings', this._reckoningService.reckoningId()!, 'transactions', String(transactionId)],
          data,
        )
        .pipe(setResourceStatusAfterLoaded(this._updateTransactionStatus))
        .pipe()
        .subscribe({
          next: transaction => {
            this._snackbarController.openSuccess($localize`:@@transactions.updated-transaction:Zapisano transakcję`);
            this._summaryService.reload({ transactions: true });
            resolve(transaction);
          },
          error: () => {
            this._snackbarController.openError(
              $localize`:@@transactions.updated-transaction-error:Nie udało się zapisać transakcji`,
            );
            resolve(null);
          },
        }),
    );
  }
}
