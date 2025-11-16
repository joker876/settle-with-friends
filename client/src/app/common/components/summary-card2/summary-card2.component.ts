import { Component, input } from '@angular/core';
import { coerceBooleanProperty } from '@ardium-ui/devkit';
import { CardComponent } from "@common/components/card/card.component";

@Component({
  selector: 'app-summary-card2',
  imports: [CardComponent],
  templateUrl: './summary-card2.component.html',
  styleUrl: './summary-card2.component.scss'
})
export class SummaryCard2Component {
  readonly heading = input.required<string>();
  readonly altColoring = input<boolean, any>(false, { transform: v => coerceBooleanProperty(v) });

  readonly leftText = input.required<string>();
  readonly rightText = input<string>();
}
