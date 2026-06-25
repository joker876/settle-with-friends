import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { BooleanLike, coerceBooleanProperty } from '@ardium-ui/devkit';

export const BalanceColoringType = {
  None: 'none',
  Positive: 'positive',
  Negative: 'negative',
  All: 'all',
} as const;
export type BalanceColoringType = (typeof BalanceColoringType)[keyof typeof BalanceColoringType];

@Component({
  selector: 'app-balance',
  imports: [DecimalPipe],
  templateUrl: './balance.component.html',
  styleUrl: './balance.component.scss',
  host: {
    '[class.color-positive]': `(coloringType() === '${BalanceColoringType.Positive}' || coloringType() === '${BalanceColoringType.All}') && balance() >= 0`,
    '[class.color-negative]': `(coloringType() === '${BalanceColoringType.Negative}' || coloringType() === '${BalanceColoringType.All}') && balance() < 0`,
  },
})
export class BalanceComponent {
  readonly balance = input.required<number>();

  readonly currency = input.required<string>();

  readonly coloringType = input<BalanceColoringType>(BalanceColoringType.None);
  readonly places = input<string>('2-2');
  readonly explicitSign = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });
}
