import { Component, inject } from '@angular/core';
import { ArdiumIconButtonModule } from "@ardium-ui/ui";
import { AvatarComponent } from "@common/components/avatar/avatar.component";
import { CardComponent } from "@common/components/card/card.component";
import { SettingsService } from '../../settings.service';
import { RoleSelectorComponent } from "./role-selector/role-selector.component";

@Component({
  selector: 'app-settings-users-section',
  imports: [ArdiumIconButtonModule, CardComponent, AvatarComponent, RoleSelectorComponent],
  templateUrl: './users.section.html',
  styleUrl: './users.section.scss',
})
export class UsersSection {
  readonly settingsService = inject(SettingsService);

  onUserRoleChange(userId: number, newRole: string) {
    console.log(`User ID: ${userId}, New Role: ${newRole}`);
    // TODO
  }
}
