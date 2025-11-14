import { Directive, input, TemplateRef } from "@angular/core";

@Directive({ selector: 'app-grid > ng-template[app-column-tmp]' })
export class GridColumnTemplateDirective {
  readonly name = input.required<string>({ alias: 'app-column-tmp' });

  constructor(public template: TemplateRef<any>) {}
}