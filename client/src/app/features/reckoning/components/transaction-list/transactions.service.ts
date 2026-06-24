import { inject, Injectable, signal } from '@angular/core';
import { HttpService } from '@common/services/http-service';
import { SnackbarController } from '@common/services/snackbar-controller.service';
import { setLoadingFalse } from '@common/utils/rxjs';
import { ReckoningService } from '@features/reckoning/services/reckoning.service';

@Injectable()
export class TransactionsService {
  private readonly _reckoningService = inject(ReckoningService);
  private readonly _http = inject(HttpService);
  private readonly _snackbarController = inject(SnackbarController);

  //! delete
  private readonly _deleteTransactionLoading = signal<boolean>(false);
  public readonly deleteTransactionLoading = this._deleteTransactionLoading.asReadonly();

  public deleteTransaction(transactionId: number) {
    if (this._deleteTransactionLoading()) return;

    this._deleteTransactionLoading.set(true);

    return new Promise<boolean>(resolve =>
      this._http
        .delete(['reckonings', this._reckoningService.reckoningId()!, 'transactions', String(transactionId)])
        .pipe(setLoadingFalse(this._deleteTransactionLoading))
        .subscribe({
          next: () => {
            this._snackbarController.openSuccess($localize`:@@transactions.deleted-transaction:Usunięto transakcję`);
            resolve(true);
          },
          error: () => {
            this._snackbarController.openError(
              $localize`:@@transactions.deleted-transaction-error:Nie udało się usunąć transakcji`,
            );
            resolve(false);
          },
        }),
    );
  }
}
