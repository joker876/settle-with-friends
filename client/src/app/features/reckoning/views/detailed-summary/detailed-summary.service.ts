import { inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpService } from '@common/services/http-service';
import { ensureParams } from '@common/utils/resource';
import { ReckoningService } from '@features/reckoning/services/reckoning.service';
import { singleUser, UsersService } from '@features/reckoning/services/users.service';
import { IGetDetailedSummaryResponse, IPersonalSummary } from '@shared/contracts/summary/get-detailed';
import { map } from 'rxjs';

@Injectable()
export class DetailedSummaryService {
  private readonly _http = inject(HttpService);
  private readonly _reckoningService = inject(ReckoningService);
  private readonly _usersService = inject(UsersService);

  private readonly _summary = rxResource({
    params: () => ({ id: this._reckoningService.reckoningId() }),
    stream: ({ params }) =>
      ensureParams(
        params.id,
        this._http
          .get<IGetDetailedSummaryResponse>(['reckonings', params.id!, 'summary/detailed'])
          .pipe(
            this._usersService.waitForUsersLoaded(),
            map(
              this._usersService.hydrateUsersInArraySingle<IGetDetailedSummaryResponse, IPersonalSummary>(
                'personalSummaries',
                [singleUser('user', 'userId')],
              ),
            ),
          ),
      ),
  });
  public readonly summary = this._summary.asReadonly();
}
