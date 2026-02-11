import { Component, input } from '@angular/core';
import { BooleanLike, coerceBooleanProperty } from '@ardium-ui/devkit';
import { CardComponent } from '@common/components/card/card.component';
import { StackComponent } from '@common/components/stack/stack.component';
import { StatisticComponent } from '@common/components/statistic/statistic.component';

@Component({
  selector: 'app-card-with-heading',
  imports: [CardComponent, StackComponent, StatisticComponent],
  templateUrl: './card-with-heading.component.html',
  styleUrl: './card-with-heading.component.scss',
})
export class CardWithHeadingComponent {
  readonly heading = input.required<string>();
  readonly subheading = input<string>();

  readonly dangerZone = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });
}
