import { Component, input } from '@angular/core';
import { StatisticComponent } from '../statistic/statistic.component';

@Component({
  selector: 'app-view-h1',
  imports: [StatisticComponent],
  templateUrl: './view-h1.component.html',
  styleUrl: './view-h1.component.scss',
})
export class ViewH1Component {
  readonly heading = input.required<string>();
  readonly subheading = input.required<string>();
}
