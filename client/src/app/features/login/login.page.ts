import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '@common/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [RouterOutlet],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
  providers: [AuthService],
})
export class LoginPage {
  private readonly _authService = inject(AuthService);

  login() {
    this._authService.login();
  }
}
