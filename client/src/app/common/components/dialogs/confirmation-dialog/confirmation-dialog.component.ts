import { Component, input, model, output } from '@angular/core';
import { ArdiumDialogModule } from '@ardium-ui/ui';

@Component({
  selector: 'app-confirmation-dialog',
  imports: [ArdiumDialogModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss',
})
export class ConfirmationDialogComponent {
  readonly open = model.required<boolean>();

  readonly submit = output<void>();

  readonly heading = input.required<string>();
  readonly confirmButtonText = input.required<string>();
}
