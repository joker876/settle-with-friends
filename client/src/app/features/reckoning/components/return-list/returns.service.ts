import { inject, Injectable, ResourceStatus, signal } from '@angular/core';
import { HttpService } from '@common/services/http-service';
import { SnackbarController } from '@common/services/snackbar-controller.service';
import { setResourceStatusAfterLoaded } from '@common/utils/rxjs';
import { ReckoningService } from '@features/reckoning/services/reckoning.service';
import { UsersService } from '@features/reckoning/services/users.service';
import { hydrateReturn } from '@features/reckoning/utils/hydration/return';
import { IReturn, IReturnBasicData } from '@shared/entities/return';

@Injectable()
export class ReturnsService {
  private readonly _reckoningService = inject(ReckoningService);
  private readonly _usersService = inject(UsersService);
  private readonly _http = inject(HttpService);
  private readonly _snackbarController = inject(SnackbarController);

  //! create
  private readonly _createReturnStatus = signal<ResourceStatus>('idle');
  public readonly createReturnStatus = this._createReturnStatus.asReadonly();

  public createReturn(data: IReturnBasicData) {
    if (this._createReturnStatus() === 'loading') return;

    this._createReturnStatus.set('loading');

    return new Promise<IReturn | null>(resolve =>
      this._http
        .post<IReturn, IReturnBasicData>(['reckonings', this._reckoningService.reckoningId()!, 'returns'], data)
        .pipe(setResourceStatusAfterLoaded(this._createReturnStatus), hydrateReturn(this._usersService))
        .subscribe({
          next: rtn => {
            this._snackbarController.openSuccess($localize`:@@returns.created-return:Dodano zwrot`);
            resolve(rtn);
          },
          error: () => {
            this._snackbarController.openError($localize`:@@returns.created-return-error:Nie udało się dodać zwrotu`);
            resolve(null);
          },
        }),
    );
  }

  //! update
  private readonly _updateReturnStatus = signal<ResourceStatus>('idle');
  public readonly updateReturnStatus = this._updateReturnStatus.asReadonly();

  public updateReturn(returnId: number, data: IReturnBasicData) {
    if (this._updateReturnStatus() === 'loading') return;

    this._updateReturnStatus.set('loading');

    return new Promise<IReturn | null>(resolve =>
      this._http
        .put<IReturn, IReturnBasicData>(
          ['reckonings', this._reckoningService.reckoningId()!, 'returns', String(returnId)],
          data,
        )
        .pipe(setResourceStatusAfterLoaded(this._updateReturnStatus), hydrateReturn(this._usersService))
        .subscribe({
          next: rtn => {
            this._snackbarController.openSuccess($localize`:@@returns.updated-return:Zapisano zwrot`);
            resolve(rtn);
          },
          error: () => {
            this._snackbarController.openError($localize`:@@returns.updated-return-error:Nie udało się zapisać zwrotu`);
            resolve(null);
          },
        }),
    );
  }

  //! delete
  private readonly _deleteReturnStatus = signal<ResourceStatus>('idle');
  public readonly deleteReturnStatus = this._deleteReturnStatus.asReadonly();

  public deleteReturn(returnId: number) {
    if (this._deleteReturnStatus() === 'loading') return;

    this._deleteReturnStatus.set('loading');

    return new Promise<boolean>(resolve =>
      this._http
        .delete(['reckonings', this._reckoningService.reckoningId()!, 'returns', String(returnId)])
        .pipe(setResourceStatusAfterLoaded(this._deleteReturnStatus))
        .subscribe({
          next: () => {
            this._snackbarController.openSuccess($localize`:@@returns.deleted-return:Usunięto zwrot`);
            resolve(true);
          },
          error: () => {
            this._snackbarController.openError($localize`:@@returns.deleted-return-error:Nie udało się usunąć zwrotu`);
            resolve(false);
          },
        }),
    );
  }
}
