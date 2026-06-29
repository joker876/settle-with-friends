import { persistentSignal, PersistentStorageMethod, WritablePersistentSignal } from '@ardium-ui/devkit';

export class TimedFlag {
  private readonly _signal!: WritablePersistentSignal<Date | null>;

  constructor(
    key: string,
    private readonly _defaultDurationMs: number = 5 * 60 * 1000,
  ) {
    this._signal = persistentSignal<Date | null>(null, {
      method: PersistentStorageMethod.LocalStorage,
      key,
      serialize: v => (v ? v.toISOString() : null),
      deserialize: v => (v ? new Date(v) : null),
    });
  }

  private _timeout: any = null;
  setFlag(durationMs: number = this._defaultDurationMs) {
    const expirationDate = new Date(Date.now() + durationMs);
    this._signal.set(expirationDate);

    if (this._timeout) {
      clearTimeout(this._timeout);
    }
    this._timeout = setTimeout(() => {
      this._signal.set(null);
    }, durationMs);
  }
  resetFlag() {
    this._signal.set(null);
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
  }

  isActive() {
    const expirationDate = this._signal();
    return expirationDate !== null && expirationDate > new Date();
  }
}
