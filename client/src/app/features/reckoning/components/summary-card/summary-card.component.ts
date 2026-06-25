import { Component, input } from '@angular/core';
import { CardComponent } from "@common/components/card/card.component";
import { StatisticComponent } from '@common/components/statistic/statistic.component';

@Component({
  selector: 'app-summary-card',
  imports: [CardComponent, StatisticComponent],
  templateUrl: './summary-card.component.html',
  styleUrl: './summary-card.component.scss',
})
export class SummaryCardComponent {
  readonly heading = input.required<string>();
}
