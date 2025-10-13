import { Component, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ArdiumButtonModule, ArdiumFormFieldModule, ArdiumInputModule, ArdiumSegmentModule } from '@ardium-ui/ui';
import { AuthService } from '@common/services/auth.service';
import { RequiredNonNullable, WrapInAbstractControl } from '@common/utils/form-types';
import { IAuthRegisterRequestDto } from '@shared/contracts/auth/register';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, ArdiumFormFieldModule, ArdiumInputModule, ArdiumSegmentModule, ArdiumButtonModule],
  templateUrl: './register.view.html',
  styleUrl: './register.view.scss',
})
export class RegisterView {
  private readonly _authService = inject(AuthService);

  constructor() {
    effect(() => {
      const user = this._authService.userData();
      if (!user) return;

      this.form.reset({
        displayName: user.displayName,
        acceptsPhoto: false,
      });
    });
    effect(() => {
      const isRegistered = this._authService.isRegistered();
      if (isRegistered) {
        this._authService.navigateToMainPage();
      }
    });
  }

  readonly form = new FormGroup<WrapInAbstractControl<IAuthRegisterRequestDto>>({
    displayName: new FormControl<string>(''),
    acceptsPhoto: new FormControl<boolean>(false),
  });

  //! display name
  private readonly _displayNameBeforeEdit = signal<string>('');

  onDisplayNameFocus() {
    this._displayNameBeforeEdit.set(this.form.value.displayName ?? '');
  }
  onDisplayNameBlur() {
    if (this.form.value.displayName) return;

    this.form.controls.displayName.setValue(this._displayNameBeforeEdit());
  }

  //! accepting
  onAcceptClick() {
    this._authService.register(this.form.value as RequiredNonNullable<typeof this.form.value>);
  }
}
