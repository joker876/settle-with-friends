import { Component } from '@angular/core';

@Component({
  selector: 'ard-icon-upload',
  standalone: true,
  template: `<svg
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    viewBox="0 0 24 24"
    style="enable-background:new 0 0 24 24;"
  >
    <path class="st0" d="M11.9993,4.08v10.0631 M11.9993,4.08l3.4428,3.7078 M11.9993,4.08L8.5566,7.7878" />
    <path
      class="st0"
      d="M4.32,14.6738v1.5892c0,1.7546,1.423,3.1776,3.1776,3.1776h9.0042c1.7546,0,3.1776-1.423,3.1776-3.1776v-1.5892
	"
    />
  </svg> `,
  host: {
    class: 'ard-icon-outlined',
  },
})
export class ArdIconUpload {}
