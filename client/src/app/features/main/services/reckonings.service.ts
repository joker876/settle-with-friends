import { inject, Injectable, ResourceStatus, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpService } from '@common/services/http-service';
import { SnackbarController } from '@common/services/snackbar-controller.service';
import { setResourceStatusAfterLoaded } from '@common/utils/rxjs';
import { ICreateReckoningRequestDto } from '@shared/contracts/reckonings/create';
import { GetAllReckoningsResponseDto, IReckoningTableData } from '@shared/contracts/reckonings/get-all';

@Injectable({
  providedIn: 'root',
})
export class ReckoningsService {
  private readonly _http = inject(HttpService);
  private readonly _snackbarController = inject(SnackbarController);

  private readonly _reckonings = rxResource({
    stream: () => this._http.get<GetAllReckoningsResponseDto>('/reckonings'),
    defaultValue: [],
  });
  public readonly reckonings = this._reckonings.asReadonly();

  private _addReckoningToList(data: IReckoningTableData): void {
    this._reckonings.update(reckonings => [...reckonings, data]);
  }

  //! creating
  private readonly _createReckoningStatus = signal<ResourceStatus>('idle');
  public readonly createReckoningStatus = this._createReckoningStatus.asReadonly();

  public createReckoning(reckoningData: ICreateReckoningRequestDto) {
    if (this._createReckoningStatus() === 'loading') return;

    this._createReckoningStatus.set('loading');

    return new Promise<boolean>(resolve => {
      this._http
        .post<IReckoningTableData, ICreateReckoningRequestDto>('/reckonings', reckoningData)
        .pipe(setResourceStatusAfterLoaded(this._createReckoningStatus))
        .subscribe({
          next: res => {
            resolve(true);
            this._addReckoningToList(res);
            console.log("%cChange URL to reckoning's page", 'color:lime');
          },
          error: () => {
            resolve(false);
            this._snackbarController.openError(
              $localize`:@@create-reckoning.snackbar.error:Nie udało się utworzyć rozliczenia`,
            );
          },
        });
    });
  }
}
