import { Component } from '@angular/core';

@Component({
  selector: 'ard-icon-pencil',
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
      <line class="st0" x1="18.143" y1="10.161" x2="12.83" y2="5.604" />
      <path
        class="st0"
        d="M19.479,8.57L9.649,20.286C9.269,20.738,8.708,21,8.117,21H4.499l-0.02-0.02l-0.628-3.562
		c-0.103-0.582,0.058-1.18,0.438-1.633L14.119,4.07c1.06-1.27,2.95-1.43,4.22-0.37l0.77,0.64C20.379,5.41,20.539,7.3,19.479,8.57z"
      />
    </g>
  </svg> `,
  host: {
    class: 'ard-icon-outlined',
  },
})
export class ArdIconPencil {}
