import { Component, input } from '@angular/core';
import { CardComponent } from "../card/card.component";

@Component({
  selector: 'app-section-card',
  imports: [CardComponent],
  templateUrl: './section-card.component.html',
  styleUrl: './section-card.component.scss'
})
export class SectionCardComponent {
  readonly heading = input.required<string>();
}
