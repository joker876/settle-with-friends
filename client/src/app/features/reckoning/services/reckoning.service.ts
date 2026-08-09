import { computed, inject, Injectable, ResourceStatus, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { EventType, Router } from '@angular/router';
import { HttpService } from '@common/services/http-service';
import { SnackbarController } from '@common/services/snackbar-controller.service';
import { ensureParams } from '@common/utils/resource';
import { setLoadingFalse, setResourceStatusAfterLoaded } from '@common/utils/rxjs';
import { ICreateReckoningRequestDto } from '@shared/contracts/reckonings/create';
import { IReckoningTableData } from '@shared/contracts/reckonings/get-all';
import { IUpdateReckoningRequestDto } from '@shared/contracts/reckonings/update';
import { IReckoning } from '@shared/entities/reckoning';
import { filter, map } from 'rxjs';

@Injectable()
export class ReckoningService {
  private readonly _http = inject(HttpService);
  private readonly _router = inject(Router);
  private readonly _snackbarController = inject(SnackbarController);

  public readonly reckoningId = toSignal(
    inject(Router).events.pipe(
      filter(event => event.type === EventType.NavigationEnd),
      map(v => v.url.match(/\/r\/(\d+)/)?.[1]),
    ),
  );

  private readonly _reckoning = rxResource({
    params: () => ({ id: this.reckoningId() }),
    stream: ({ params }) => ensureParams(params.id, this._http.get<IReckoning>(['reckonings', params.id!])),
  });

  public readonly reckoning = this._reckoning.asReadonly();

  public readonly isArchived = computed(() => this.reckoning.value()?.archivedAt != null);

  //! creating reckoning
  private readonly _createReckoningStatus = signal<ResourceStatus>('idle');
  public readonly createReckoningStatus = this._createReckoningStatus.asReadonly();

  public createReckoning(data: ICreateReckoningRequestDto) {
    if (this._createReckoningStatus() === 'loading') return;

    this._createReckoningStatus.set('loading');

    this._http
      .post<IReckoningTableData, ICreateReckoningRequestDto>('reckonings', data)
      .pipe(setResourceStatusAfterLoaded(this._createReckoningStatus))
      .subscribe({
        next: () => {
          this._snackbarController.openSuccess($localize`:@@reckoning-page.create.success:Utworzono rozliczenie`);
        },
        error: () => {
          this._snackbarController.openError(
            $localize`:@@reckoning-page.create.error:Nie udało się utworzyć rozliczenia`,
          );
        },
      });
  }

  //! updating reckoning
  private readonly _updateReckoningLoading = signal<boolean>(false);
  public readonly updateReckoningLoading = this._updateReckoningLoading.asReadonly();

  public async updateReckoning(data: IUpdateReckoningRequestDto): Promise<boolean> {
    const reckoningId = this.reckoningId();
    if (!reckoningId) return false;

    if (this._updateReckoningLoading()) return false;

    this._updateReckoningLoading.set(true);

    return new Promise<boolean>(resolve => {
      this._http
        .patch<void, IUpdateReckoningRequestDto>(`reckonings/${reckoningId}`, data)
        .pipe(setLoadingFalse(this._updateReckoningLoading))
        .subscribe({
          next: () => {
            this._snackbarController.openSuccess(
              $localize`:@@reckoning-page.update.success:Zaktualizowano rozliczenie`,
            );
            this._reckoning.update(v => ({
              ...v!,
              ...data,
            }));
            resolve(true);
          },
          error: () => {
            this._snackbarController.openError(
              $localize`:@@reckoning-page.update.error:Nie udało się zaktualizować rozliczenia`,
            );
            resolve(false);
          },
        });
    });
  }

  //! deleting reckoning
  deleteReckoning() {
    const reckoningId = this.reckoningId();
    if (!reckoningId) return;

    return new Promise<boolean>(resolve =>
      this._http.delete(`reckonings/${reckoningId}`).subscribe({
        next: () => {
          this._snackbarController.openSuccess($localize`:@@reckoning-page.delete.success:Usunięto rozliczenie`);
          this._router.navigate(['/']);
          resolve(true);
        },
        error: () => {
          this._snackbarController.openError(
            $localize`:@@reckoning-page.delete.error:Nie udało się usunąć rozliczenia`,
          );
          resolve(false);
        },
      }),
    );
  }

  //! archiving reckoning
  archiveReckoning() {
    const reckoningId = this.reckoningId();
    if (!reckoningId) return;

    return new Promise<boolean>(resolve =>
      this._http.patch(`reckonings/${reckoningId}/archive`, {}).subscribe({
        next: () => {
          this._reckoning.update(v => ({
            ...v!,
            archivedAt: new Date(),
          }));
          this._snackbarController.openSuccess($localize`:@@reckoning-page.archive.success:Zarchiwizowano rozliczenie`);
          resolve(true);
        },
        error: err => {
          if (err.status === 409) {
            this._snackbarController.openError(
              $localize`:@@reckoning-page.archive.error.already-archived:Rozliczenie jest już zarchiwizowane`,
            );
          } else {
            this._snackbarController.openError(
              $localize`:@@reckoning-page.archive.error:Nie udało się zarchiwizować rozliczenia`,
            );
          }
          resolve(false);
        },
      }),
    );
  }

  //! unarchiving reckoning
  unarchiveReckoning() {
    const reckoningId = this.reckoningId();
    if (!reckoningId) return;

    return new Promise<boolean>(resolve =>
      this._http.patch(`reckonings/${reckoningId}/unarchive`, {}).subscribe({
        next: () => {
          this._reckoning.update(v => ({
            ...v!,
            archivedAt: null,
          }));
          this._snackbarController.openSuccess($localize`:@@reckoning-page.unarchive.success:Przywrócono rozliczenie`);
          resolve(true);
        },
        error: err => {
          if (err.status === 409) {
            this._snackbarController.openError(
              $localize`:@@reckoning-page.unarchive.error.not-archived:Rozliczenie nie jest zarchiwizowane`,
            );
          } else {
            this._snackbarController.openError(
              $localize`:@@reckoning-page.unarchive.error:Nie udało się przywrócić rozliczenia`,
            );
          }
          resolve(false);
        },
      }),
    );
  }
}
