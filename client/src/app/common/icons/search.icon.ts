import { Component } from '@angular/core';

@Component({
  selector: 'ard-icon-search',
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
      <circle class="st0" cx="11.438" cy="11.438" r="8.438" />
      <line class="st0" x1="17.4" y1="17.4" x2="21" y2="21" />
    </g>
  </svg> `,
  host: {
    class: 'ard-icon-outlined',
  },
})
export class ArdIconSearch {}
