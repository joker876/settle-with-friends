import { Component } from '@angular/core';

@Component({
  selector: 'ard-icon-checkbox-filled',
  standalone: true,
  template: `<svg
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    viewBox="0 0 24 24"
    style="enable-background:new 0 0 24 24;"
  >
    <path
      class="st0"
      d="M16.22,2.25H7.78c-3.3101,0-5.53,2.32-5.53,5.78V15.97c0,3.46,2.22,5.78,5.53,5.78H16.22c3.3101,0,5.53-2.32,5.53-5.78V8.03
	C21.75,4.57,19.53,2.25,16.22,2.25z M16.54,9.52l-5.78,6c-0.14,0.15-0.33,0.23-0.54,0.23c-0.2,0-0.4-0.08-0.54-0.23l-2.22-2.31
	c-0.29-0.3-0.28-0.77,0.02-1.06c0.3-0.28,0.77-0.28,1.06,0.02l1.68,1.75L15.46,8.48c0.29-0.3,0.7599-0.31,1.06-0.02
	C16.82,8.75,16.83,9.22,16.54,9.52z"
    />
  </svg> `,
  host: {
    class: 'ard-icon-filled',
  },
})
export class ArdIconCheckboxFilled {}
