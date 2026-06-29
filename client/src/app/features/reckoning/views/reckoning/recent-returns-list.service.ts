import { inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpService } from '@common/services/http-service';
import { ensureParams } from '@common/utils/resource';
import { ReckoningService } from '@features/reckoning/services/reckoning.service';
import { UsersService } from '@features/reckoning/services/users.service';
import { hydrateReturn } from '@features/reckoning/utils/hydration/return';
import { IReturn } from '@shared/entities/return';

@Injectable()
export class RecentReturnListService {
  private readonly _http = inject(HttpService);
  private readonly _reckoningService = inject(ReckoningService);
  private readonly _usersService = inject(UsersService);

  private readonly _returns = rxResource({
    params: () => ({ reckoningId: this._reckoningService.reckoningId() }),
    stream: ({ params }) =>
      ensureParams(
        params.reckoningId,
        this._http
          .get<IReturn[]>(['reckonings', params.reckoningId!, 'returns'])
          .pipe(this._usersService.waitForUsersLoaded(), hydrateReturn(this._usersService, true)),
        [],
      ),
    defaultValue: [],
  });

  public readonly returns = this._returns.asReadonly();

  appendReturn(rtn: IReturn): void {
    this._returns.update(returns => [...returns, rtn]);
  }
  refreshReturn(updatedReturn: IReturn): void {
    this._returns.update(returns =>
      returns.map(rtn => (rtn.id === updatedReturn.id ? updatedReturn : rtn)),
    );
  }
  removeReturn(returnId: number): void {
    this._returns.update(returns => returns.filter(rtn => rtn.id !== returnId));
  }
}
