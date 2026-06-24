import { DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { BooleanLike, coerceBooleanProperty } from '@ardium-ui/devkit';

@Component({
  selector: 'app-money',
  imports: [DecimalPipe],
  templateUrl: './money.component.html',
  styleUrl: './money.component.scss',
  host: {
    '[class.green]': 'withGreen() && !isNegative()',
    '[class.red]': 'isNegative()',
  },
})
export class MoneyComponent {
  readonly amount = input.required<number | string | null>();

  readonly isNegative = computed<boolean>(() => {
    const amount = this.amount();
    return typeof amount === 'number' && amount < 0;
  });
  readonly shouldUsePipe = computed<boolean>(() => typeof this.amount() === 'number' );

  readonly currency = input.required<string | null>();

  readonly withGreen = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });
}
