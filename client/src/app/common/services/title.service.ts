import { effect, inject, Injectable, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TitleService {
  private readonly _title = inject(Title);
  readonly currentBaseTitle = signal<string | null>(null);

  private readonly _titlePrefix = environment.envPrefix;
  private readonly _titleSuffix = $localize`:@@page-title-suffix: :: Rozlicznik`;

  constructor() {
    effect(() => {
      const title = this.currentBaseTitle()
        ? this._titlePrefix + this.currentBaseTitle() + this._titleSuffix
        : this._titlePrefix + $localize`:@@page-title-fallback:Rozlicznik`;
      this._title.setTitle(title);
    });
  }
}
