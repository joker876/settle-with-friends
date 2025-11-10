import { Component, input } from '@angular/core';
import { coerceBooleanProperty } from '@ardium-ui/devkit';
import { CardComponent } from "../card/card.component";

@Component({
  selector: 'app-summary-card',
  imports: [CardComponent],
  templateUrl: './summary-card.component.html',
  styleUrl: './summary-card.component.scss'
})
export class SummaryCardComponent {
  readonly heading = input.required<string>();
  readonly altColoring = input<boolean, any>(false, { transform: v => coerceBooleanProperty(v) });

  readonly leftText = input.required<string>();
  readonly rightText = input<string>();
}
