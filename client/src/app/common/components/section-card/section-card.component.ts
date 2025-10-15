import { Component, input } from '@angular/core';

@Component({
  selector: 'app-section-card',
  imports: [],
  templateUrl: './section-card.component.html',
  styleUrl: './section-card.component.scss'
})
export class SectionCardComponent {
  readonly heading = input.required<string>();
}
