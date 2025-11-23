import { Component, input } from '@angular/core';
import { StatisticComponent } from "../statistic/statistic.component";

@Component({
  selector: 'app-statistic-with-icon',
  imports: [StatisticComponent],
  templateUrl: './statistic-with-icon.component.html',
  styleUrl: './statistic-with-icon.component.scss'
})
export class StatisticWithIconComponent {
  readonly value = input<string>();
}
