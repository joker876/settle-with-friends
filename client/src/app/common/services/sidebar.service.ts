import { inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { EventType, Router } from '@angular/router';
import { filter, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private readonly _router = inject(Router);

  private readonly _isOpen = signal<boolean>(false);
  public readonly isOpen = this._isOpen.asReadonly();

  toggle(): void {
    this._isOpen.update(value => !value);
  }

  public readonly reckoningId = toSignal(
    inject(Router).events.pipe(
      filter(event => event.type === EventType.NavigationEnd),
      map(v => v.url.match(/\/r\/(\d+)/)?.[1]),
    ),
  );
}
