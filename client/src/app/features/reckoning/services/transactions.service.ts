import { inject, Injectable, ResourceStatus, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpService } from '@common/services/http-service';
import { SnackbarController } from '@common/services/snackbar-controller.service';
import { ensureParams } from '@common/utils/resource';
import { setResourceStatusAfterLoaded } from '@common/utils/rxjs';
import { ICreateTransactionRequestDto } from '@shared/contracts/transactions/create';
import { ITransaction } from '@shared/entities/transaction';
import { ITransactionSplitPart, ITransactionSplitPartIncludee } from '@shared/entities/transaction-includee';
import { ITransactionPayer } from '@shared/entities/transaction-payer';
import { map } from 'rxjs';
import { ReckoningService } from './reckoning.service';
import { multipleUsers, singleUser, UsersService } from './users.service';

@Injectable()
export class TransactionsService {
  private readonly _reckoningService = inject(ReckoningService);
  private readonly _usersService = inject(UsersService);
  private readonly _http = inject(HttpService);
  private readonly _snackbarController = inject(SnackbarController);

  private readonly _transactions = rxResource({
    params: () => ({ reckoningId: this._reckoningService.reckoningId() }),
    stream: ({ params }) =>
      ensureParams(
        params.reckoningId,
        this._http
          .get<ITransaction[]>(['reckonings', params.reckoningId!, 'transactions'])
          .pipe(
            this._usersService.waitForUsersLoaded(),
            map(
              this._usersService.hydrateUsers([
                singleUser<ITransaction>('createdBy', 'createdByUserId'),
                singleUser<ITransaction>('updatedBy', 'updatedByUserId'),
                multipleUsers<ITransaction, ITransactionPayer>('payers'),
              ]),
            ),
            map(
              this._usersService.hydrateUsersInArray<ITransaction, ITransactionSplitPart>('splitParts', [
                multipleUsers<ITransactionSplitPart, ITransactionSplitPartIncludee>('includees'),
              ]),
            ),
          ),
        [],
      ),
    defaultValue: [],
  });

  public readonly transactions = this._transactions.asReadonly();

  //! creating transaction
  private readonly _createTransactionStatus = signal<ResourceStatus>('idle');
  public readonly createTransactionStatus = this._createTransactionStatus.asReadonly();

  public createTransaction(data: ICreateTransactionRequestDto) {
    if (this._createTransactionStatus() === 'loading') return;

    this._createTransactionStatus.set('loading');

    return new Promise<boolean>(resolve =>
      this._http
        .post<ITransaction, ICreateTransactionRequestDto>(
          ['reckonings', this._reckoningService.reckoningId()!, 'transactions'],
          data,
        )
        .pipe(setResourceStatusAfterLoaded(this._createTransactionStatus))
        .subscribe({
          next: transaction => {
            this._snackbarController.openSuccess('Dodano transakcję');
            this._transactions.update(v => [...v, transaction]);
            resolve(true);
          },
          error: () => {
            this._snackbarController.openError('Nie udało się dodać transakcji');
            resolve(false);
          },
        }),
    );
  }
}
