import { Component } from '@angular/core';

@Component({
  selector: 'ard-icon-plus-circle',
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
      <path class="st0" d="M12,7.8v8.5" />
      <path class="st0" d="M16.2,12H7.8" />
    </g>
    <circle class="st0" cx="12" cy="12" r="9" />
  </svg> `,
  host: {
    class: 'ard-icon-outlined',
  },
})
export class ArdIconPlusCircle {}
