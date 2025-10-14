import { effect, inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpService } from '@common/services/http-service';
import { IReckoning } from '@shared/entities/reckoning';

@Injectable({
  providedIn: 'root',
})
export class ReckoningsService {
  private readonly _http = inject(HttpService);

  private readonly _reckonings = rxResource({
    loader: () => this._http.get<IReckoning[]>('/reckonings'),
  });
  public readonly reckonings = this._reckonings.asReadonly();

  fdjnfd = effect(() => {
    console.log(this.reckonings.value());
  });
}
