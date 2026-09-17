import { inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AuthService } from '@common/services/auth.service';
import { HttpService } from '@common/services/http-service';
import { SnackbarController } from '@common/services/snackbar-controller.service';
import { ensureParams } from '@common/utils/resource';
import { setLoadingFalse } from '@common/utils/rxjs';
import { IGetAccountSettingsResponse, IUpdateAccountSettingsRequest } from '@shared/contracts/account/account-settings';

@Injectable()
export class AccountSettingsService {
  private readonly _http = inject(HttpService);
  private readonly _authService = inject(AuthService);
  readonly snackbarController = inject(SnackbarController);

  private readonly _accountData = rxResource({
    params: () => ({ isLoggedIn: this._authService.isLoggedIn() }),
    stream: ({ params }) =>
      ensureParams(params.isLoggedIn, this._http.get<IGetAccountSettingsResponse>('account-settings'), null),
  });
  public readonly accountData = this._accountData.asReadonly();

  //! update
  private readonly _isUpdateAccountSettingsLoading = signal<boolean>(false);
  public readonly isUpdateAccountSettingsLoading = this._isUpdateAccountSettingsLoading.asReadonly();

  async updateAccountSettings(data: IUpdateAccountSettingsRequest) {
    if (this._isUpdateAccountSettingsLoading()) return;

    const existing = this.accountData.value();
    if (existing && existing.displayName === data.displayName && existing.photo === data.photo) {
      this.snackbarController.openSuccess($localize`:@@account-settings.updated:Zapisano!`);
      return;
    }

    this._isUpdateAccountSettingsLoading.set(true);

    const dataBefore = this._accountData.value();
    this._accountData.update(v => (v ? { ...v, ...data } : v));

    this._http
      .patch('account-settings', data)
      .pipe(setLoadingFalse(this._isUpdateAccountSettingsLoading))
      .subscribe({
        next: () => {
          this.snackbarController.openSuccess($localize`:@@account-settings.updated:Zapisano!`);
          this._authService.updateUserData(data);
        },
        error: () => {
          this._accountData.set(dataBefore);
          this.snackbarController.openError($localize`:@@account-settings.updated-error:Nie udało się zapisać!`);
        },
      });
  }

  //! delete
  private readonly _isDeleteAccountLoading = signal<boolean>(false);
  public readonly isDeleteAccountLoading = this._isDeleteAccountLoading.asReadonly();

  async deleteAccount() {
    if (this._isDeleteAccountLoading()) return;

    this._isDeleteAccountLoading.set(true);

    this._http
      .delete('account-settings')
      .pipe(setLoadingFalse(this._isDeleteAccountLoading))
      .subscribe({
        next: () => {
          this._authService.navigateToLoginOnAccountDeleted();
          this.snackbarController.openSuccess($localize`:@@account-settings.deleted:Twoje konto zostało usunięte`);
        },
        error: () => {
          this.snackbarController.openError($localize`:@@account-settings.deleted-error:Nie udało się usunąć konta!`);
        },
      });
  }
}
