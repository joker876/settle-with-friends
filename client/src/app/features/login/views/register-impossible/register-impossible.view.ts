import { Component, inject } from '@angular/core';
import { ArdiumSpinnerModule } from '@ardium-ui/ui';
import { AuthService } from '@common/services/auth.service';

@Component({
  selector: 'app-register-impossible',
  imports: [ArdiumSpinnerModule],
  templateUrl: './register-impossible.view.html',
  styleUrl: './register-impossible.view.scss'
})
export class RegisterImpossibleView {
  private readonly _authService = inject(AuthService);

  constructor() {
    this._authService.logoutBecauseRegistrationUnavailable();
  }
}
