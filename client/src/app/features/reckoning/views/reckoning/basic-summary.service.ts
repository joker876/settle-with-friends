import { effect, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpService } from '@common/services/http-service';
import { ensureParams } from '@common/utils/resource';
import { ReckoningService } from '@features/reckoning/services/reckoning.service';
import { IGetBasicSummaryResponse } from '@shared/contracts/summary/get-basic';

@Injectable()
export class BasicSummaryService {
  private readonly _reckoningService = inject(ReckoningService);
  private readonly _http = inject(HttpService);

  private readonly _summary = rxResource({
    params: () => ({ id: this._reckoningService.reckoningId() }),
    stream: ({ params }) =>
      ensureParams(params.id, this._http.get<IGetBasicSummaryResponse>(['reckonings', params.id!, 'summary/basic'])),
  });
  public readonly summary = this._summary.asReadonly();

  private readonly _isReloadingTransactions = signal<boolean>(false);
  public readonly isReloadingTransactions = this._isReloadingTransactions.asReadonly();

  private readonly _isReloadingReturns = signal<boolean>(false);
  public readonly isReloadingReturns = this._isReloadingReturns.asReadonly();

  reload({ returns = false, transactions = false }: { returns?: boolean; transactions?: boolean } = {}) {
    if (transactions) {
      this._isReloadingTransactions.set(true);
    }
    if (returns) {
      this._isReloadingReturns.set(true);
    }
    this._summary.reload();
  }

  constructor() {
    effect(() => {
      if (this._summary.isLoading() === false) {
        this._isReloadingTransactions.set(false);
        this._isReloadingReturns.set(false);
      }
    });
  }
}
