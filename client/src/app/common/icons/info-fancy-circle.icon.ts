import { Component } from '@angular/core';

@Component({
  selector: 'ard-icon-info-fancy-circle-filled',
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
      <path
        class="st0"
        d="M12.07,2.25c-5.38,0-9.75,4.37-9.75,9.75s4.37,9.75,9.75,9.75s9.75-4.37,9.75-9.75S17.45,2.25,12.07,2.25z M12,7.31
		c0.55,0,1,0.45,1,1s-0.45,1-1,1s-1-0.45-1-1S11.45,7.31,12,7.31z M12.85,16.69H12c-0.41,0-0.75-0.34-0.75-0.75v-3.52h-0.1
		c-0.42,0-0.75-0.33-0.75-0.75c0-0.41,0.33-0.75,0.75-0.75H12c0.41,0,0.75,0.34,0.75,0.75v3.52h0.1c0.42,0,0.75,0.33,0.75,0.75
		C13.6,16.35,13.27,16.69,12.85,16.69z"
      />
    </g>
  </svg> `,
  host: {
    class: 'ard-icon-filled',
  },
})
export class ArdIconInfoFancyCircleFilled {}
