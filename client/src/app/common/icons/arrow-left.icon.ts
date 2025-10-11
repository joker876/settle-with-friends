import { Component } from '@angular/core';

@Component({
  selector: 'ard-icon-arrow-left',
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
      <path class="st0" d="M10.4541,5.5742l-6.4533,6.4256l6.4533,6.4267" />
      <path class="st0" d="M4,12h16" />
    </g>
  </svg> `,
  host: {
    class: 'ard-icon-outlined',
  },
})
export class ArdIconArrowLeft {}
