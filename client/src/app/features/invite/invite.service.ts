import { effect, inject, Injectable, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { EventType, Router } from '@angular/router';
import { AuthService } from '@common/services/auth.service';
import { HttpService } from '@common/services/http-service';
import { SnackbarController } from '@common/services/snackbar-controller.service';
import { ensureParams } from '@common/utils/resource';
import { setLoadingFalse } from '@common/utils/rxjs';
import { IInviteLinkDataResponse } from '@shared/contracts/participants/join-from-invite-link';
import { filter, map } from 'rxjs';

@Injectable()
export class InviteService {
  private readonly _http = inject(HttpService);
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);
  private readonly _snackbarController = inject(SnackbarController);

  public readonly token = toSignal(
    this._router.events.pipe(
      filter(event => event.type === EventType.NavigationEnd),
      map(v => v.url.match(/\/invite\/(.+)/)?.[1]),
    ),
  );

  private readonly _inviteLinkData = rxResource({
    params: () => ({
      token: this._authService.isLoggedIn() ? this.token() : null,
    }),
    stream: ({ params }) =>
      ensureParams(params.token, this._http.get<IInviteLinkDataResponse>(['invite-link', params.token!, 'data']), null),
  });
  public readonly inviteLinkData = this._inviteLinkData.asReadonly();

  constructor() {
    effect(() => {
      const data = this._inviteLinkData.value();
      if (data?.alreadyJoined) {
        // this._router.navigateByUrl('/r/' + data.reckoning.id);
      }
    });
  }

  private readonly _isJoinFromInviteLinkLoading = signal<boolean>(false);
  public readonly isJoinFromInviteLinkLoading = this._isJoinFromInviteLinkLoading.asReadonly();

  async joinFromInviteLink() {
    if (this._isJoinFromInviteLinkLoading()) return;

    this._isJoinFromInviteLinkLoading.set(true);

    this._http
      .post(['invite-link', this.token()!, 'join'], {})
      .pipe(setLoadingFalse(this._isJoinFromInviteLinkLoading))
      .subscribe({
        next: () => {
          this._router.navigateByUrl('/r/' + this._inviteLinkData.value()!.reckoning.id);
          this._snackbarController.openSuccess($localize`:@@invite.joined:Dołączyłeś do rozliczenia!`);
        },
        error: err => {
          if (err.status === 409) {
            this._router.navigateByUrl('/r/' + this._inviteLinkData.value()!.reckoning.id);
            return;
          }
          this._snackbarController.openError($localize`:@@invite.join-error:Nie udało się dołączyć do rozliczenia!`);
        },
      });
  }
}
