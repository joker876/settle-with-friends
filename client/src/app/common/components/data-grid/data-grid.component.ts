import { Component, computed, input } from '@angular/core';
import { ResponsiveConfig, transformResponsiveValue } from '@common/utils/responsive';

@Component({
  selector: 'app-data-grid',
  imports: [],
  templateUrl: './data-grid.component.html',
  styleUrl: './data-grid.component.scss',
  host: {
    '[style]': 'styleVariables()',
  },
})
export class DataGridComponent {
  readonly cols = input<Required<ResponsiveConfig>, number | string | ResponsiveConfig>(
    { base: 1, sm: 1, md: 1, lg: 1, xl: 1 },
    { transform: transformResponsiveValue }
  );

  readonly styleVariables = computed<string>(() =>
    [
      `--_data-grid-cols-base: ${this.cols().base}`,
      `--_data-grid-cols-sm: ${this.cols().sm}`,
      `--_data-grid-cols-md: ${this.cols().md}`,
      `--_data-grid-cols-lg: ${this.cols().lg}`,
      `--_data-grid-cols-xl: ${this.cols().xl}`,
    ].join(';')
  );
}
