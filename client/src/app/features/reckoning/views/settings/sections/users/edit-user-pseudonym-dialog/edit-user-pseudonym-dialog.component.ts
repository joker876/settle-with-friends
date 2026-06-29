import { Component, effect, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ArdiumDialogModule, ArdiumFormFieldModule, ArdiumInputModule, ArdiumStackModule } from '@ardium-ui/ui';
import { IUserWithRole } from '@shared/entities/user';

@Component({
  selector: 'app-edit-user-pseudonym-dialog',
  imports: [ArdiumDialogModule, ArdiumInputModule, ArdiumStackModule, ArdiumFormFieldModule, ReactiveFormsModule],
  templateUrl: './edit-user-pseudonym-dialog.component.html',
  styleUrl: './edit-user-pseudonym-dialog.component.scss',
})
export class EditUserPseudonymDialogComponent {
  readonly user = input.required<IUserWithRole>();

  readonly newPseudonym = new FormControl<string | null>(null, {
    validators: [Validators.required, Validators.maxLength(50)],
  });

  readonly submit = output<string>();
  readonly close = output<void>();

  constructor() {
    effect(() => {
      this.newPseudonym.setValue(this.user().displayName);
    });
  }

  onSubmit() {
    if (this.newPseudonym.invalid) return;
    this.submit.emit(this.newPseudonym.value!);
  }
}
