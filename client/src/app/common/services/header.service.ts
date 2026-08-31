import { effect, inject, Injectable, Injector, Signal, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  private readonly _injector = inject(Injector);

  private readonly _headerText = signal<string | null>(null);
  public readonly headerText = this._headerText.asReadonly();

  setText(text: string | null): void {
    this._headerText.set(text);
  }
  setTextFromSignal(signal: Signal<string | null>): void;
  setTextFromSignal<T>(signal: Signal<T>, transform: (value: T) => string | null): void;
  setTextFromSignal<T = string | null>(
    signal: Signal<T>,
    transform: (value: T) => string | null = v => v as string | null,
  ): void {
    effect(
      () => {
        this.setText(transform(signal()));
      },
      { injector: this._injector },
    );
  }
}
