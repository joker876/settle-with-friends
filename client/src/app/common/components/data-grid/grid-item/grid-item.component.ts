import { Component, computed, input } from '@angular/core';
import { ResponsiveConfig, transformResponsiveValue } from '@common/utils/responsive';

@Component({
  selector: 'app-grid-item',
  imports: [],
  templateUrl: './grid-item.component.html',
  styleUrl: './grid-item.component.scss',
  host: {
    '[style]': 'styleVariables()',
  },
})
export class GridItemComponent {
  readonly span = input<Required<ResponsiveConfig>, number | string | ResponsiveConfig>(
    { base: 1, sm: 1, md: 1, lg: 1, xl: 1 },
    { transform: transformResponsiveValue }
  );

  readonly styleVariables = computed<string>(() =>
    [
      `--_data-grid-span-base: ${this.span().base}`,
      `--_data-grid-span-sm: ${this.span().sm}`,
      `--_data-grid-span-md: ${this.span().md}`,
      `--_data-grid-span-lg: ${this.span().lg}`,
      `--_data-grid-span-xl: ${this.span().xl}`,
    ].join(';')
  );
}
