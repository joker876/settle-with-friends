import { Component, input } from '@angular/core';
import { coerceArrayProperty } from '@ardium-ui/devkit';
import { PluralizePLPipe } from 'ngx-polish-number-to-words';

@Component({
  selector: 'app-plural',
  imports: [PluralizePLPipe],
  template: '{{ value() | pluralizePL:forms()[0]:forms()[1]:forms()[2]:true }}',
  styles: ':host { display: inline; }',
})
export class PluralComponent {
  readonly value = input.required<number>();

  readonly forms = input.required<[string, string, string], [string, string, string] | string>({
    transform: v => coerceArrayProperty(v) as [string, string, string],
  });
}
