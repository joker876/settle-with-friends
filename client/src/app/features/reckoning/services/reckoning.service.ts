import { inject, Injectable } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { EventType, Router } from '@angular/router';
import { HttpService } from '@common/services/http-service';
import { IReckoning } from '@shared/entities/reckoning';
import { filter, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReckoningService {
  private readonly _http = inject(HttpService);

  public readonly reckoningId = toSignal(
    inject(Router).events.pipe(
      filter(event => event.type === EventType.NavigationEnd),
      map(v => v.url.match(/\/r\/(\d+)/)?.[1]),
    ),
  );

  private readonly _reckoning = rxResource({
    request: () => ({ id: this.reckoningId() }),
    loader: ({ request }) => (request.id ? this._http.get<IReckoning>(['reckonings', request.id]) : of(undefined)),
  });

  public readonly reckoning = this._reckoning.asReadonly();
}
