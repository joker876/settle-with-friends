import { inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpService } from '@common/services/http-service';
import { ensureParams } from '@common/utils/resource';
import { ITransaction } from '@shared/entities/transaction';
import { ITransactionSplitPart, ITransactionSplitPartIncludee } from '@shared/entities/transaction-includee';
import { ITransactionPayer } from '@shared/entities/transaction-payer';
import { map } from 'rxjs';
import { ReckoningService } from './reckoning.service';
import { multipleUsers, singleUser, UsersService } from './users.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  private readonly _reckoningService = inject(ReckoningService);
  private readonly _usersService = inject(UsersService);
  private readonly _http = inject(HttpService);

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
      ),
  });

  public readonly transactions = this._transactions.asReadonly();
}
