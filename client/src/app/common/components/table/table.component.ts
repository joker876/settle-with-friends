import { Component, input, ViewEncapsulation } from '@angular/core';
import { coerceBooleanProperty } from '@ardium-ui/devkit';

@Component({
  selector: 'app-table',
  imports: [],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class TableComponent {
  readonly withMenu = input<boolean, any>(false, { transform: v => coerceBooleanProperty(v) });
}
