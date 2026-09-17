import { computed, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Data, EventType, NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private readonly _router = inject(Router);

  private readonly _data = toSignal(
    this._router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      startWith(null),
      map(() => {
        let route = this._router.routerState.root;

        let data = route.snapshot.data;

        while (route.firstChild) {
          route = route.firstChild;
          
          data = { ...data, ...route.snapshot.data}
        }

        return data;
      }),
    ),
    {
      initialValue: {} as Data,
    },
  );
  public readonly isVisible = computed(() => !!this._data()['sidebar']);

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
