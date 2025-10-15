import { inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpService } from '@common/services/http-service';
import { GetAllReckoningsResponseDto } from '@shared/contracts/reckonings/get-all';

@Injectable({
  providedIn: 'root',
})
export class ReckoningsService {
  private readonly _http = inject(HttpService);

  private readonly _reckonings = rxResource({
    loader: () => this._http.get<GetAllReckoningsResponseDto>('/reckonings'),
  });
  public readonly reckonings = this._reckonings.asReadonly();
}
