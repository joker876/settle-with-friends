import { Component } from '@angular/core';

@Component({
  selector: 'ard-icon-logout',
  standalone: true,
  template: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg"
  x="0px" y="0px"
  viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;">
<g>
	<g transform="translate(2.000000, 2.000000)">
		<path class="st0" d="M12.8675,5.6419V4.7598c0-1.9241-1.5601-3.4842-3.4842-3.4842H4.774
			c-1.9232,0-3.4832,1.5601-3.4832,3.4842v10.5234c0,1.9241,1.5601,3.4842,3.4832,3.4842h4.6188
			c1.9184,0,3.4747-1.5554,3.4747-3.4738V14.402"/>
		<line class="st0" x1="19.2908" y1="10.0214" x2="7.906" y2="10.0214"/>
		<polyline class="st0" points="16.522,7.2652 19.2905,10.0213 16.522,12.7784"/>
	</g>
</g>
</svg>`,
  host: {
    class: 'ard-icon-outlined'
  }
})
export class ArdIconLogout {}
