import { Directive, effect, ElementRef, inject, input, Renderer2, ViewContainerRef } from '@angular/core';
import { BooleanLike, coerceBooleanProperty } from '@ardium-ui/devkit';
import { ArdiumSpinnerComponent } from '@ardium-ui/ui';

@Directive({
  selector: '[appLoadingBlocker]',
  host: {
    class: 'loading-blocker',
  },
})
export class LoadingBlockerDirective {
  readonly isLoading = input.required<boolean>({ alias: 'appLoadingBlocker' });

  private readonly _element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly _viewContainerRef = inject(ViewContainerRef);
  private readonly _renderer = inject(Renderer2);

  readonly noSpinner = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });

  constructor() {
    effect(() => {
      if (this.isLoading()) {
        this._renderer.addClass(this._element, 'loading-blocker__active');
        this.insertComponent();
      } else {
        this._renderer.removeClass(this._element, 'loading-blocker__active');
        this.removeComponent();
      }
    });
  }

  private _componentRef: any;

  private insertComponent() {
    if (this.noSpinner()) {
      return;
    }
    this._viewContainerRef.clear();
    this._componentRef = this._viewContainerRef.createComponent(ArdiumSpinnerComponent);
    this._element.insertBefore(this._componentRef.location.nativeElement, this._element.firstChild);
  }

  private removeComponent() {
    this._componentRef?.destroy();
  }
}
