import { Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@common/services/auth.service';
import { LoginGoogleComponent } from '@features/login/components/login-google/login-google.component';
import { LogoutReason } from '@shared/enums/logout-reason';

@Component({
  selector: 'app-login',
  imports: [LoginGoogleComponent],
  templateUrl: './login.view.html',
  styleUrl: './login.view.scss',
})
export class LoginView {
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);

  readonly loginReason = this._authService.logoutReason;
  readonly LogoutReason = LogoutReason;

  constructor() {
    effect(() => {
      if (this._authService.isSafeToRedirect() && this._authService.isLoggedIn()) {
        this._router.navigateByUrl('/');
      }
    });
  }
}
