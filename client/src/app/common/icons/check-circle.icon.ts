import { Component } from '@angular/core';

@Component({
  selector: 'ard-icon-check-circle-filled',
  standalone: true,
  template: `
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      viewBox="0 0 24 24"
      style="enable-background:new 0 0 24 24;"
    >
      <g>
        <path
          class="st0"
          d="M12,2.25c-5.38,0-9.75,4.37-9.75,9.75s4.37,9.75,9.75,9.75s9.75-4.37,9.75-9.75S17.38,2.25,12,2.25z M15.99,10.22
		L11.38,14.84c-0.15,0.15-0.34,0.22-0.53,0.22c-0.2,0-0.39-0.07-0.54-0.22L8,12.53c-0.29-0.29-0.29-0.77,0-1.0601
		c0.3-0.29,0.77-0.29,1.07,0l1.78,1.78l4.08-4.09c0.3-0.29,0.77-0.29,1.06,0C16.29,9.45,16.29,9.93,15.99,10.22z"
        />
      </g>
    </svg>
  `,
  host: {
    class: 'ard-icon-filled',
  },
})
export class ArdIconCheckCircleFilled {}
