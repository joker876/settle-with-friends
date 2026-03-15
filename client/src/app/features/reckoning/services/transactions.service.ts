import { inject, Injectable, ResourceStatus, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpService } from '@common/services/http-service';
import { SnackbarController } from '@common/services/snackbar-controller.service';
import { ensureParams } from '@common/utils/resource';
import { setResourceStatusAfterLoaded } from '@common/utils/rxjs';
import { ICreateTransactionRequestDto } from '@shared/contracts/transactions/create';
import { IUpdateTransactionRequestDto } from '@shared/contracts/transactions/update';
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
              this._usersService.hydrateUsers<ITransaction>([
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

  public getTransaction(id: number): ITransaction | null {
    return this._transactions.value().find(v => v.id === id) ?? null;
  }

  //! create
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
        .pipe(
          map(
            this._usersService.hydrateUsersSingle([
              singleUser<ITransaction>('createdBy', 'createdByUserId'),
              singleUser<ITransaction>('updatedBy', 'updatedByUserId'),
              multipleUsers<ITransaction, ITransactionPayer>('payers'),
            ]),
          ),
          map(
            this._usersService.hydrateUsersInArraySingle<ITransaction, ITransactionSplitPart>('splitParts', [
              multipleUsers<ITransactionSplitPart, ITransactionSplitPartIncludee>('includees'),
            ]),
          ),
        )
        .subscribe({
          next: transaction => {
            this._snackbarController.openSuccess($localize`:@@transactions.created-transaction:Dodano transakcję`);
            this._transactions.update(v => [...v, transaction]);
            resolve(true);
          },
          error: () => {
            this._snackbarController.openError(
              $localize`:@@transactions.created-transaction-error:Nie udało się dodać transakcji`,
            );
            resolve(false);
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

    return new Promise<boolean>(resolve =>
      this._http
        .put<ITransaction, IUpdateTransactionRequestDto>(
          ['reckonings', this._reckoningService.reckoningId()!, 'transactions', String(transactionId)],
          data,
        )
        .pipe(setResourceStatusAfterLoaded(this._updateTransactionStatus))
        .pipe(
          map(
            this._usersService.hydrateUsersSingle([
              singleUser<ITransaction>('createdBy', 'createdByUserId'),
              singleUser<ITransaction>('updatedBy', 'updatedByUserId'),
              multipleUsers<ITransaction, ITransactionPayer>('payers'),
            ]),
          ),
          map(
            this._usersService.hydrateUsersInArraySingle<ITransaction, ITransactionSplitPart>('splitParts', [
              multipleUsers<ITransactionSplitPart, ITransactionSplitPartIncludee>('includees'),
            ]),
          ),
        )
        .subscribe({
          next: transaction => {
            this._snackbarController.openSuccess($localize`:@@transactions.updated-transaction:Zapisano transakcję`);
            this._transactions.update(v => v.map(t => (t.id !== transactionId ? t : transaction)));
            resolve(true);
          },
          error: () => {
            this._snackbarController.openError(
              $localize`:@@transactions.updated-transaction-error:Nie udało się zapisać transakcji`,
            );
            resolve(false);
          },
        }),
    );
  }

  //! delete
  private readonly _deleteTransactionStatus = signal<ResourceStatus>('idle');
  public readonly deleteTransactionStatus = this._deleteTransactionStatus.asReadonly();

  public deleteTransaction(transactionId: number) {
    if (this._deleteTransactionStatus() === 'loading') return;

    this._deleteTransactionStatus.set('loading');

    this._http
      .delete(['reckonings', this._reckoningService.reckoningId()!, 'transactions', String(transactionId)])
      .pipe(setResourceStatusAfterLoaded(this._deleteTransactionStatus))
      .subscribe({
        next: () => {
          this._snackbarController.openSuccess($localize`:@@transactions.deleted-transaction:Usunięto transakcję`);

          this._transactions.update(t => t.filter(v => v.id !== transactionId));
        },
        error: () => {
          this._snackbarController.openError(
            $localize`:@@transactions.deleted-transaction-error:Nie udało się usunąć transakcji`,
          );
        },
      });
  }
}
