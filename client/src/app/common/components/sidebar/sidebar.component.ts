import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ArdIconBankCardPayment, ArdIconClipboardTwoLines, ArdIconCoins, ArdIconHandCoins, ArdIconHome, ArdIconSettings, ArdIconUser_2 } from '@ardium-ui/icons';
import { SidebarService } from '@common/services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterModule,
    ArdIconHome,
    ArdIconSettings,
    ArdIconCoins,
    ArdIconHandCoins,
    ArdIconBankCardPayment,
    ArdIconClipboardTwoLines,
    ArdIconUser_2
],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  host: {
    // '[class.visible]': 'sidebarService.'
  }
})
export class SidebarComponent {
  readonly sidebarService = inject(SidebarService);
}
