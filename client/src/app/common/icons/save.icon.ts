import { Component } from '@angular/core';

@Component({
  selector: 'ard-icon-save',
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
      <path class="st0" d="M16.8,20.5v-4.4c0-1.2-1-2.1-2.1-2.1H9.3c-1.2,0-2.1,1-2.1,2.1v4.4" />
      <path
        class="st0"
        d="M3.5,7.8v8.5c0,2.3,1.9,4.2,4.2,4.2h8.5c2.3,0,4.2-1.9,4.2-4.2v-5.1c0-1.1-0.4-2.2-1.2-3l-3.4-3.4
		c-0.8-0.8-1.9-1.2-3-1.2l-5.1,0C5.4,3.5,3.5,5.4,3.5,7.8z"
      />
      <line class="st0" x1="8.5" y1="8.4" x2="13.9" y2="8.4" />
    </g>
  </svg> `,
  host: {
    class: 'ard-icon-outlined',
  },
})
export class ArdIconSave {}
