import { Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, LogoutReason } from '@common/services/auth.service';
import { TitleService } from '@common/services/title.service';
import { LoginGoogleComponent } from '@features/login/components/login-google/login-google.component';

@Component({
  selector: 'app-login',
  imports: [LoginGoogleComponent],
  templateUrl: './login.view.html',
  styleUrl: './login.view.scss',
})
export class LoginView {
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);
  private readonly _titleService = inject(TitleService);

  readonly logoutReason = this._authService.logoutReason;
  readonly LogoutReason = LogoutReason;

  constructor() {
    effect(() => {
      const logoutReason = this._authService.logoutReason();
      let title = '';
      switch (logoutReason) {
        case LogoutReason.LoggedOut:
          title = $localize`:@@login.page-title.logged-out:Wylogowane poprawnie`;
          break;

        case LogoutReason.SessionExpired:
          title = $localize`:@@login.page-title.logged-out:Sesja logowania wygasła`;
          break;

        default:
          title = $localize`:@@login.page-title.default:Logowanie`;
          break;
      }
      this._titleService.currentBaseTitle.set(title);
    });
    effect(() => {
      if (this._authService.isSafeToRedirect() && this._authService.isLoggedIn()) {
        this._router.navigateByUrl('/');
      }
    });
  }
}
