import { Component } from '@angular/core';

@Component({
  selector: 'ard-icon-check',
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
      <path class="st0" d="M19,7.1875l-9.625,9.625L5,12.4375" />
    </g>
  </svg> `,
  host: {
    class: 'ard-icon-outlined',
  },
})
export class ArdIconCheck {}
