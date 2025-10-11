import { Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, LogoutReason } from '@common/services/auth.service';
import { LoginGoogleComponent } from './components/login-google/login-google.component';

@Component({
  selector: 'app-login',
  imports: [LoginGoogleComponent],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage {
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);

  readonly logoutReason = this._authService.LogoutReason;
  readonly LogoutReason = LogoutReason;

  constructor() {
    effect(() => {
      if (this._authService.isSafeToRedirect() && this._authService.isLoggedIn()) {
        this._router.navigateByUrl('/');
      }
    });
  }
}
