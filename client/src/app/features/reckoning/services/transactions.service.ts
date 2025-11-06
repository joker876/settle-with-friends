import { inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpService } from '@common/services/http-service';
import { ITransaction } from '@shared/entities/transaction';
import { of } from 'rxjs';
import { ReckoningService } from './reckoning.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  private readonly _reckoningService = inject(ReckoningService);
  private readonly _http = inject(HttpService);

  private readonly _transactions = rxResource({
    request: () => ({ reckoningId: this._reckoningService.reckoningId() }),
    loader: ({ request }) =>
      request.reckoningId
        ? this._http.get<ITransaction>(['reckonings', request.reckoningId, 'transactions'])
        : of(undefined),
  });
}
