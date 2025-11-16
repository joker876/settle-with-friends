import { CommonModule } from '@angular/common';
import { Component, contentChildren, input } from '@angular/core';
import { GridColumnTemplateDirective } from './grid.directives';
import { IColumnDef } from './grid.types';

@Component({
  selector: 'app-grid',
  imports: [CommonModule],
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.scss',
  host: {
    '[style.--_grid-column-count]': 'columns().length',
  },
})
export class GridComponent {
  readonly columns = input.required<IColumnDef[], IColumnDef[]>({
    transform: cols => cols.filter(col => !col.isHidden),
  });

  readonly data = input.required<Record<string, any>[]>();

  readonly templateChildren = contentChildren<GridColumnTemplateDirective>(GridColumnTemplateDirective);

  getCellTemplate(name: string | undefined) {
    return name ? this.templateChildren().find(tmp => tmp.name() === name)?.template : undefined;
  }
}
