import { inject, Injectable, ResourceStatus, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { EventType, Router } from '@angular/router';
import { HttpService } from '@common/services/http-service';
import { SnackbarController } from '@common/services/snackbar-controller.service';
import { ensureParams } from '@common/utils/resource';
import { setResourceStatusAfterLoaded } from '@common/utils/rxjs';
import { ICreateReckoningRequestDto } from '@shared/contracts/reckonings/create';
import { IReckoningTableData } from '@shared/contracts/reckonings/get-all';
import { IReckoning } from '@shared/entities/reckoning';
import { filter, map } from 'rxjs';

@Injectable()
export class ReckoningService {
  private readonly _http = inject(HttpService);
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
}
