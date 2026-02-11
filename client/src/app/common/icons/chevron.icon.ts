import { Component, input } from '@angular/core';
import { BooleanLike, coerceBooleanProperty } from '@ardium-ui/devkit';

@Component({
  selector: 'ard-icon-chevron',
  standalone: true,
  template: `<svg
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    viewBox="0 0 24 24"
    style="enable-background:new 0 0 24 24;"
  >
    <g>
      <path class="st0" d="M18,9l-6,6L6,9" />
    </g>
  </svg> `,
  host: {
    class: 'ard-icon-outlined custom-icon rotatable',
    '[class.rotate-down]': 'down()',
    '[class.rotate-up]': 'up()',
    '[class.rotate-left]': 'left()',
    '[class.rotate-right]': 'right()',
  },
})
export class ArdIconChevron {
  readonly down = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });
  readonly up = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });
  readonly left = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });
  readonly right = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });
}
