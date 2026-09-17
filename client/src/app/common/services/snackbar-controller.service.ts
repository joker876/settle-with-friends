import { inject, Injectable } from '@angular/core';
import { ArdiumSnackbarService, ArdSnackbarQueueHandling, ArdSnackbarType, ComponentColor } from '@ardium-ui/ui';

@Injectable({
  providedIn: 'root',
})
export class SnackbarController {
  private readonly _snackbarService = inject(ArdiumSnackbarService);

  openError(message: string, action?: string): void {
    this._snackbarService.open(message, action, {
      type: ArdSnackbarType.Danger,
      color: ComponentColor.Danger,
      duration: 3000,
      queueHandling: ArdSnackbarQueueHandling.Overwrite,
    });
  }
  openSuccess(message: string, action?: string): void {
    this._snackbarService.open(message, action, {
      type: ArdSnackbarType.Success,
      color: ComponentColor.Success,
      duration: 3000,
      queueHandling: ArdSnackbarQueueHandling.Overwrite,
    });
  }
  openInfo(message: string, action?: string): void {
    this._snackbarService.open(message, action, {
      type: ArdSnackbarType.Success,
      color: ComponentColor.Success,
      duration: 3000,
      queueHandling: ArdSnackbarQueueHandling.Overwrite,
    });
  }
}
