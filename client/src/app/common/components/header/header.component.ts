import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { ArdIconChevron, ArdIconLogout, ArdIconSettings } from '@ardium-ui/icons';
import { ArdiumButtonModule } from '@ardium-ui/ui';
import { AuthService } from '@common/services/auth.service';
import { AvatarComponent } from '../avatar/avatar.component';
import { MenuItemComponent } from "../menu-item/menu-item.component";

@Component({
  selector: 'app-header',
  imports: [FormsModule, AvatarComponent, ArdiumButtonModule, ArdIconChevron, MatMenuModule, MatDividerModule, MenuItemComponent, ArdIconSettings, ArdIconLogout],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  readonly authService = inject(AuthService);

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
