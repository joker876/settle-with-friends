import { computed, effect, inject, Injectable, Injector, linkedSignal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { join } from 'pathe';
import { filter, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  private readonly _router = inject(Router);
  private readonly _injector = inject(Injector);

  private readonly _headerText = linkedSignal<{ url: string }, string | null>({
    source: () => ({ url: this._url() }),
    computation: (_, previous) => {
      if (previous?.source.url === '-') return previous?.value;
      return null;
    },
  });
  public readonly headerText = this._headerText.asReadonly();

  private readonly _goBackUrl = linkedSignal<{ url: string }, string | null>({
    source: () => ({ url: this._url() }),
    computation: (_, previous) => {
      if (previous?.source.url === '-') return previous?.value ?? null;
      return null;
    },
  });
  public readonly goBackUrl = computed(() => {
    let url = this._goBackUrl();

    if (url && !url.startsWith('/')) {
      url = join(this._url(), url);
    }
    return url;
  });

  setText(text: string | null): void {
    this._headerText.set(text);
  }
  setTextFromSignal(signal: Signal<string | null | undefined>): void;
  setTextFromSignal<T>(signal: Signal<T>, transform: (value: T) => string | null | undefined): void;
  setTextFromSignal<T = string | null | undefined>(
    signal: Signal<T>,
    transform: (value: T) => string | null | undefined = v => v as string | null | undefined,
  ): void {
    effect(
      () => {
        this.setText(transform(signal()) ?? null);
      },
      { injector: this._injector },
    );
  }

  setGoBack(url: string | null) {
    this._goBackUrl.set(url);
  }

  private readonly _url = toSignal(
    this._router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(v => v.urlAfterRedirects),
    ),
    {
      initialValue: '-',
    },
  );
}
