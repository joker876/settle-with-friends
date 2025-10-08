import { Component, inject } from '@angular/core';
import { LoginService } from './services/login.service';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
  providers: [LoginService],
})
export class LoginPage {
  private readonly _loginService = inject(LoginService);

  login() {
    this._loginService.login('/login');
  }
}
