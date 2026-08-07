import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ArdIconArrowLeft } from "@ardium-ui/icons";
import { ArdiumButtonModule } from '@ardium-ui/ui';

@Component({
  selector: 'app-back-button',
  imports: [ArdiumButtonModule, ArdIconArrowLeft, RouterModule],
  templateUrl: './back-button.component.html',
  styleUrl: './back-button.component.scss',
})
export class BackButtonComponent {
  readonly link = input.required<string>();
}
