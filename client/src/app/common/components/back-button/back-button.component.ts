import { Component } from '@angular/core';
import { ArdiumButtonModule } from '@ardium-ui/ui';
import { ArdIconArrowLeft } from '@common/icons/arrow-left.icon';

@Component({
  selector: 'app-back-button',
  imports: [ArdiumButtonModule, ArdIconArrowLeft],
  templateUrl: './back-button.component.html',
  styleUrl: './back-button.component.scss',
})
export class BackButtonComponent {}
