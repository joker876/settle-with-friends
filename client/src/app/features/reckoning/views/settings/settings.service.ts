import { inject, Injectable } from '@angular/core';
import { mapSignal } from '@ardium-ui/devkit';
import { AuthService } from '@common/services/auth.service';
import { HttpService } from '@common/services/http-service';
import { SnackbarController } from '@common/services/snackbar-controller.service';
import { setLoadingFalse } from '@common/utils/rxjs';
import { ReckoningService } from '@features/reckoning/services/reckoning.service';
import { UsersService } from '@features/reckoning/services/users.service';
import {
  IUpdateUserPseudonymRequest,
  IUpdateUserPseudonymResponse,
} from '@shared/contracts/participants/update-pseudonym';
import { IUpdateUserRoleRequest, IUpdateUserRoleResponse } from '@shared/contracts/participants/update-role';
import { UserRole } from '@shared/enums/user-role';

@Injectable()
export class SettingsService {
  private readonly _http = inject(HttpService);
  private readonly _snackbarController = inject(SnackbarController);
  private readonly _reckoningService = inject(ReckoningService);
  private readonly _usersService = inject(UsersService);
  private readonly _authService = inject(AuthService);

  public readonly users = this._usersService.users;
  public readonly currentUser = this._authService.userData;

  //! update pseudonym
  readonly userPseudonymLoadingMap = mapSignal<number, boolean>();

  async updateUserPseudonym(userId: number, newPseudonym: string): Promise<boolean> {
    const reckoningId = this._reckoningService.reckoningId();
    if (!reckoningId) return false;

    this.userPseudonymLoadingMap.setKey(userId, true);
    const oldPseudonym = this._usersService.updateUserPseudonym(userId, newPseudonym);

    return new Promise(resolve =>
      this._http
        .patch<IUpdateUserPseudonymResponse, IUpdateUserPseudonymRequest>(
          `/reckonings/${reckoningId}/participants/${userId}/pseudonym`,
          { pseudonym: newPseudonym },
        )
        .pipe(setLoadingFalse(this.userPseudonymLoadingMap, userId))
        .subscribe({
          next: () => {
            this._snackbarController.openSuccess(
              $localize`:@@participants.updated-pseudonym-successfully:Zapisano nowy pseudonim`,
            );
            resolve(true);
          },
          error: () => {
            this._usersService.updateUserPseudonym(userId, oldPseudonym!);
            this._snackbarController.openError(
              $localize`:@@participants.failed-to-update-pseudonym:Nie udało się zapisać pseudonimu`,
            );
            resolve(false);
          },
        }),
    );
  }

  //! update role
  readonly userRoleLoadingMap = mapSignal<number, boolean>();

  async updateUserRole(userId: number, newRole: UserRole): Promise<boolean> {
    const reckoningId = this._reckoningService.reckoningId();
    if (!reckoningId) return false;

    this.userRoleLoadingMap.setKey(userId, true);
    const oldRole = this._usersService.updateUserRole(userId, newRole);

    return new Promise(resolve =>
      this._http
        .patch<IUpdateUserRoleResponse, IUpdateUserRoleRequest>(
          `/reckonings/${reckoningId}/participants/${userId}/role`,
          { role: newRole },
        )
        .pipe(setLoadingFalse(this.userRoleLoadingMap, userId))
        .subscribe({
          next: () => {
            this._snackbarController.openSuccess(
              $localize`:@@participants.updated-role-successfully:Zapisano nową rolę`,
            );
            resolve(true);
          },
          error: () => {
            this._usersService.updateUserRole(userId, oldRole!);
            this._snackbarController.openError(
              $localize`:@@participants.failed-to-update-role:Nie udało się zapisać roli`,
            );
            resolve(false);
          },
        }),
    );
  }

  //! kick or leave
  readonly userKickOrLeaveLoadingMap = mapSignal<number, boolean>();

  async userKickOrLeave(userId: number): Promise<boolean> {
    const reckoningId = this._reckoningService.reckoningId();
    if (!reckoningId) return false;

    const isSelf = this.currentUser()?.id === userId;

    this.userKickOrLeaveLoadingMap.setKey(userId, true);

    return new Promise(resolve =>
      this._http
        .delete<void>(`/reckonings/${reckoningId}/participants/${userId}/kick-or-leave`)
        .pipe(setLoadingFalse(this.userKickOrLeaveLoadingMap, userId))
        .subscribe({
          next: () => {
            if (isSelf) {
              this._snackbarController.openSuccess($localize`:@@participants.left-successfully:Opuszczono rozliczenie`);
            } else {
              this._snackbarController.openSuccess(
                $localize`:@@participants.kicked-successfully:Wyrzucono użytkownika z rozliczenia`,
              );
            }
            resolve(true);
          },
          error: () => {
            if (isSelf) {
              this._snackbarController.openError(
                $localize`:@@participants.failed-to-leave:Nie udało się opuścić rozliczenia`,
              );
            } else {
              this._snackbarController.openError(
                $localize`:@@participants.failed-to-kick:Nie udało się wyrzucić użytkownika z rozliczenia`,
              );
            }
            resolve(false);
          },
        }),
    );
  }
}
