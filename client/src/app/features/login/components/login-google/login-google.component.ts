import { Component, inject } from '@angular/core';
import { AuthService } from '@common/services/auth.service';

@Component({
  selector: 'app-google-login',
  templateUrl: './login-google.component.html',
  styleUrls: ['./login-google.component.scss'],
})
export class LoginGoogleComponent {
  private readonly _authService = inject(AuthService);

  login(): void {
    this._authService.login();
  }
}
