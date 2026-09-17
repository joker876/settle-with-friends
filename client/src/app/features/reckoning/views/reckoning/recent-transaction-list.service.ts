import { inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpService } from '@common/services/http-service';
import { ensureParams } from '@common/utils/resource';
import { ReckoningService } from '@features/reckoning/services/reckoning.service';
import { UsersService } from '@features/reckoning/services/users.service';
import { hydrateTransaction } from '@features/reckoning/utils/hydration/transaction';
import { ITransaction } from '@shared/entities/transaction';

@Injectable()
export class RecentTransactionListService {
  private readonly _http = inject(HttpService);
  private readonly _reckoningService = inject(ReckoningService);
  private readonly _usersService = inject(UsersService);

  private readonly _transactions = rxResource({
    params: () => ({ reckoningId: this._reckoningService.reckoningId() }),
    stream: ({ params }) =>
      ensureParams(
        params.reckoningId,
        this._http
          .get<ITransaction[]>(['reckonings', params.reckoningId!, 'transactions', 'recent'])
          .pipe(this._usersService.waitForUsersLoaded(), hydrateTransaction(this._usersService, true)),
        [],
      ),
    defaultValue: [],
  });

  public readonly transactions = this._transactions.asReadonly();

  removeTransaction(transactionId: number): void {
    this._transactions.update(transactions => transactions.filter(transaction => transaction.id !== transactionId));
  }
}
