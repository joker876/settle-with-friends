import { Clipboard } from '@angular/cdk/clipboard';
import { inject, Injectable, ResourceStatus, signal } from '@angular/core';
import { HttpService } from '@common/services/http-service';
import { SnackbarController } from '@common/services/snackbar-controller.service';
import { setResourceStatusAfterLoaded } from '@common/utils/rxjs';
import { ReckoningService } from '@features/reckoning/services/reckoning.service';
import {
  IGenerateInviteLinkRequest,
  IGenerateInviteLinkResponse,
} from '@shared/contracts/participants/generate-invite-link';

@Injectable()
export class InviteLinkService {
  private readonly _http = inject(HttpService);
  private readonly _snackbarController = inject(SnackbarController);
  private readonly _reckoningService = inject(ReckoningService);
  private readonly _clipboard = inject(Clipboard); 

  private readonly _createInviteLinkStatus = signal<ResourceStatus>('idle');
  public readonly createInviteLinkStatus = this._createInviteLinkStatus.asReadonly();

  public async createInviteLink(maxUses: number | null, expirationDate: Date | null): Promise<boolean> {
    if (this._createInviteLinkStatus() === 'loading') return false;

    this._createInviteLinkStatus.set('loading');

    return new Promise<boolean>(resolve =>
      this._http
        .post<IGenerateInviteLinkResponse, IGenerateInviteLinkRequest>(
          ['reckonings', this._reckoningService.reckoningId() ?? '', 'participants/invite-link'],
          {
            userLimit: maxUses ?? 1,
            expirationDate: expirationDate ?? new Date(),
          },
        )
        .pipe(setResourceStatusAfterLoaded(this._createInviteLinkStatus))
        .subscribe({
          next: (res) => {
            this._clipboard.copy(`${window.location.origin}/invite/${res.token}`);
            
            this._snackbarController.openSuccess(
              $localize`:@@settings.invite-link-dialog.success:Link skopiowany do schowka`,
            );
            resolve(true);
          },
          error: () => {
            this._snackbarController.openError(
              $localize`:@@settings.invite-link-dialog.error:Wystąpił błąd podczas tworzenia linku`,
            );
            resolve(false);
          },
        }),
    );
  }
}
