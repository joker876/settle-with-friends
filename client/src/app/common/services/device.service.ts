import { BreakpointObserver } from '@angular/cdk/layout';
import { computed, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  readonly isMobile = toSignal(
    inject(BreakpointObserver)
      .observe([
        '(max-width: 599.98px) and (max-height: 959.98px) and (orientation: portrait), (max-width: 959.98px) and (max-height: 599.98px) and (orientation: landscape)',
      ])
      .pipe(
        takeUntilDestroyed(),
        map(v => v.matches),
      ),
  );

  readonly isWeb = computed<boolean>(() => !this.isMobile());
}
