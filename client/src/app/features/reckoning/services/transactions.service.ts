import { effect, inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpService } from '@common/services/http-service';
import { ITransaction } from '@shared/entities/transaction';
import { ITransactionPayer } from '@shared/entities/transaction-payer';
import { of } from 'rxjs';
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
    request: () => ({ reckoningId: this._reckoningService.reckoningId() }),
    loader: ({ request }) =>
      request.reckoningId
        ? this._http
            .get<ITransaction[]>(['reckonings', request.reckoningId, 'transactions'])
            .pipe(
              this._usersService.hydrateUsers([
                singleUser<ITransaction>('createdBy', 'createdByUserId'),
                singleUser<ITransaction>('updatedBy', 'updatedByUserId'),
                multipleUsers<ITransaction, ITransactionPayer>('payers'),
                multipleUsers<ITransaction>('includees'),
              ]),
            )
        : of(undefined),
  });

  public readonly transactions = this._transactions.asReadonly();
  
  djfkd = effect(() => {
    console.log(this.transactions.value());
  })
}
