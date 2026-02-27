import { Component } from '@angular/core';

@Component({
  selector: 'ard-icon-checkbox-empty',
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
      d="M7.7831,3h8.4347C19.1659,3,21,5.0802,21,8.0264v7.9472C21,18.9188,19.1659,21,16.2169,21H7.7831
	C4.835,21,3,18.9188,3,15.9736V8.0264C3,5.0802,4.8438,3,7.7831,3z"
    />
  </svg> `,
  host: {
    class: 'ard-icon-outlined',
  },
})
export class ArdIconCheckboxEmpty {}
