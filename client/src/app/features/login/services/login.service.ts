import { effect, inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpService } from 'src/app/common/services/http.service';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private readonly _http = inject(HttpService);

  login(redirectUrl?: string) {
    window.location.href =
      this._http.apiUrl +
      'auth/google/login' +
      (redirectUrl ? `?redirect=${redirectUrl}` : '');
  }

  private readonly _loginStatus = rxResource({
    loader: () => this._http.get('auth/status'),
  });

  dfjkidf = effect(() => {
    console.log(this._loginStatus.value());
  });
}
