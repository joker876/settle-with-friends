import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { ArdIconChevron, ArdIconLogout, ArdIconSettings } from '@ardium-ui/icons';
import { ArdiumButtonModule, ArdiumIconButtonModule } from '@ardium-ui/ui';
import { AuthService } from '@common/services/auth.service';
import { HeaderService } from '@common/services/header.service';
import { SidebarService } from '@common/services/sidebar.service';
import { AvatarComponent } from '../avatar/avatar.component';
import { BackButtonComponent } from '../back-button/back-button.component';
import { MenuItemComponent } from '../menu-item/menu-item.component';

@Component({
  selector: 'app-header',
  imports: [
    FormsModule,
    AvatarComponent,
    ArdiumButtonModule,
    ArdIconChevron,
    MatMenuModule,
    MatDividerModule,
    MenuItemComponent,
    ArdIconSettings,
    ArdIconLogout,
    RouterModule,
    ArdiumIconButtonModule,
    BackButtonComponent
],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  readonly authService = inject(AuthService);
  readonly headerService = inject(HeaderService);
  readonly sidebarService = inject(SidebarService);

  readonly isMenuOpen = signal<boolean>(false);

  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }
  closeMenu() {
    this.isMenuOpen.set(false);
  }

  logout() {
    this.authService.logout();
    this.closeMenu();
  }
}
