import { Component } from '@angular/core';

@Component({
  selector: 'ard-icon-x-2',
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
      <path class="st0" d="M6,6l12,12" />
      <path class="st0" d="M18,6L6,18" />
    </g>
  </svg> `,
  host: {
    class: 'ard-icon-outlined',
  },
})
export class ArdIconX_2 {}
