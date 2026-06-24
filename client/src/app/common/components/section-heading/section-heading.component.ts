import { Component, input, output } from '@angular/core';
import { ArdIconChevron } from "@common/icons/chevron.icon";
import { TextBtnComponent } from "../text-btn/text-btn.component";

@Component({
  selector: 'app-section-heading',
  imports: [TextBtnComponent, ArdIconChevron],
  templateUrl: './section-heading.component.html',
  styleUrl: './section-heading.component.scss',
})
export class SectionHeadingComponent {
  readonly heading = input.required<string>();

  readonly showAllButton = input.required<boolean>();
  readonly showAllButtonClick = output<void>();
}
