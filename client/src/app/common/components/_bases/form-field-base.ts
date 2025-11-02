import {
  computed,
  Directive,
  effect,
  inject,
  Injector,
  input,
  model,
  runInInjectionContext,
  signal,
  Signal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { NgControl, Validators } from '@angular/forms';
import { coerceBooleanProperty, coerceNumberProperty } from '@ardium-ui/devkit';
import { map, Subscription } from 'rxjs';
import { TakeChance } from 'take-chance';

@Directive()
export abstract class _FormFieldBase<T> {
  readonly disabled = signal<boolean>(false);

  readonly value = model<T | null>(null);

  //! tabindex
  readonly tabIndex = computed(() => (this.disabled() ? -1 : this._tabIndex()));
  readonly _tabIndex = input<number, any>(0, {
    alias: 'tabIndex',
    transform: v => coerceNumberProperty(v, 0),
  });

  readonly _required = input<boolean | undefined, any>(undefined, {
    transform: v => coerceBooleanProperty(v),
    alias: 'required',
  });
  get required() {
    return this._required() ?? !!this._ngControl?.control?.hasValidator(Validators.required);
  }

  readonly isSuccess = input<boolean, any>(false, { transform: v => coerceBooleanProperty(v) });

  //! control value accessor
  protected _onChangeRegistered!: (_: any) => void;
  protected _onTouchedRegistered!: () => void;

  registerOnTouched(fn: () => void): void {
    this._onTouchedRegistered = fn;
  }
  registerOnChange(fn: (_: any) => void): void {
    this._onChangeRegistered = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  abstract writeValue(v: any): void;

  constructor() {
    effect(() => {
      const v = this.value();
      this._onChangeRegistered?.(v);
    });
  }

  //! event handlers
  readonly wasTouched = signal<boolean>(false);

  onFocus(): void {
    this._shouldEmitTouched = false;
  }

  protected _shouldEmitTouched = false;
  onBlur() {
    this._shouldEmitTouched = true;

    setTimeout(() => {
      // if the component is immediately focused back (i.e. when changing focus between elements within the component)
      // the touched event will not be fired
      if (!this._shouldEmitTouched) return;
      this.wasTouched.set(true);
      this._onTouchedRegistered?.();
    }, 0);
  }

  //! form field related
  protected readonly _injector = inject(Injector);

  private _statusChangesSub?: Subscription;
  ngOnInit(): void {
    this._ngControl = this._injector.get(NgControl, null);

    if (this._ngControl) {
      if (
        !this._ngControl.valueAccessor ||
        (this && this instanceof (this._ngControl.valueAccessor as any).constructor)
      ) {
        this._ngControl.valueAccessor = this;
      }

      this._hasErrorInControl.set(this._ngControl.status === 'INVALID');

      this._statusChangesSub = this._ngControl.statusChanges
        ?.pipe(map(v => v === 'INVALID'))
        .subscribe(v => this._hasErrorInControl.set(v));

      if (!this._ngControl.control) return;

      runInInjectionContext(this._injector, () => {
        // do not read the next line of code if you are easily frightened
        // I'm not proud of this part, but it had to be done. God please forgive me
        // I didn't find any other feasible way to detect when the control changes its touched state
        // so it had to be hacked like this
        toObservable((this._ngControl?.control as any | undefined)?.touchedReactive as Signal<boolean>)?.subscribe(v =>
          this.wasTouched.set(v),
        );
      });
    }
  }
  protected _ngControl: NgControl | null = null;

  readonly htmlId = input<string>(TakeChance.id());

  readonly _hasError = input<boolean | undefined, any>(undefined, {
    transform: v => coerceBooleanProperty(v),
    alias: 'hasError',
  });
  private readonly _hasErrorInControl = signal<boolean>(false);
  readonly hasError = computed<boolean>(() => this._hasError() ?? (this.wasTouched() && this._hasErrorInControl()));

  ngOnDestroy(): void {
    this._statusChangesSub?.unsubscribe();
  }
}
