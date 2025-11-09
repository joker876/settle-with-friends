import { inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpService } from '@common/services/http-service';
import { IUser } from '@shared/entities/user';
import { of } from 'rxjs';
import { ReckoningService } from './reckoning.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly _reckoningService = inject(ReckoningService);
  private readonly _http = inject(HttpService);

  private readonly _users = rxResource({
    request: () => ({ reckoningId: this._reckoningService.reckoningId() }),
    loader: ({ request }) =>
      request.reckoningId ? this._http.get<IUser>(['reckonings', request.reckoningId, 'users']) : of(undefined),
  });

  public readonly users = this._users.asReadonly();
}
