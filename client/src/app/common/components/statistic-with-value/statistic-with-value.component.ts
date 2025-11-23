import { Component, input } from '@angular/core';
import { StatisticComponent } from "../statistic/statistic.component";

@Component({
  selector: 'app-statistic-with-value',
  imports: [StatisticComponent],
  templateUrl: './statistic-with-value.component.html',
  styleUrl: './statistic-with-value.component.scss'
})
export class StatisticWithValueComponent {
  readonly text = input.required<string>();
}
