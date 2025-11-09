import { Component, input } from '@angular/core';
import { CardComponent } from "../card/card.component";

@Component({
  selector: 'app-summary-card',
  imports: [CardComponent],
  templateUrl: './summary-card.component.html',
  styleUrl: './summary-card.component.scss'
})
export class SummaryCardComponent {
  readonly heading = input.required<string>();

  readonly leftText = input.required<string>();
  readonly rightText = input<string>();
}
