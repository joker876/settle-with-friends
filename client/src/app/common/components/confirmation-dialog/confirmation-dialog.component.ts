import { Component, computed, effect, input, model, output, signal, untracked } from '@angular/core';
import { coerceNumberProperty } from '@ardium-ui/devkit';
import { ArdiumDialogModule, ComponentColor } from '@ardium-ui/ui';

@Component({
  selector: 'app-confirmation-dialog',
  imports: [ArdiumDialogModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss',
})
export class ConfirmationDialogComponent {
  readonly open = model.required<boolean>();

  readonly submit = output<void>();
  readonly isSubmitLoading = input<boolean>(false);

  readonly heading = input.required<string>();
  readonly confirmButtonText = input.required<string>();
  readonly confirmButtonColor = input<ComponentColor>(ComponentColor.Danger);

  readonly confirmationDelaySeconds = input<number, any>(0, { transform: v => coerceNumberProperty(v, 0) });

  private readonly _confirmationDelayRemainingTime = signal<number>(0);
  readonly canConfirm = computed<boolean>(() => this._confirmationDelayRemainingTime() === 0);

  readonly confirmButtonTextWithTime = computed<string>(() =>
    this._confirmationDelayRemainingTime() > 0
      ? `${this.confirmButtonText()} (${this._confirmationDelayRemainingTime()})`
      : this.confirmButtonText()
  );

  private _countdownIntervalId: ReturnType<typeof setInterval> | null = null;
  private _clearCountdownInterval() {
    if (this._countdownIntervalId !== null) {
      clearInterval(this._countdownIntervalId);
      this._countdownIntervalId = null;
    }
  }

  constructor() {
    effect(() => {
      const open = this.open();
      const delaySeconds = this.confirmationDelaySeconds();

      this._clearCountdownInterval();

      if (!open || delaySeconds <= 0) {
        this._confirmationDelayRemainingTime.set(0);

        return;
      }
      this._confirmationDelayRemainingTime.set(delaySeconds);

      this._countdownIntervalId = setInterval(() => {
        untracked(() => {
          const remainingTime = this._confirmationDelayRemainingTime();
          if (remainingTime > 0) {
            this._confirmationDelayRemainingTime.set(remainingTime - 1);
          } else {
            this._clearCountdownInterval();
          }
        });
      }, 1000);
    });
  }
}
