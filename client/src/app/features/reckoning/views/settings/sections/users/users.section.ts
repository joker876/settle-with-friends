import { AsyncPipe } from '@angular/common';
import { Component, computed, effect, inject, model, signal } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { mapSignal } from '@ardium-ui/devkit';
import { ArdIconEditLine, ArdIconLogout, ArdIconUserEdit } from '@ardium-ui/icons';
import { ArdiumIconButtonModule, ArdiumInputModule, ArdiumSpinnerModule, ArdiumStackModule } from '@ardium-ui/ui';
import { AvatarComponent } from '@common/components/avatar/avatar.component';
import { CardComponent } from '@common/components/card/card.component';
import { CheckboxComponent } from '@common/components/checkbox/checkbox.component';
import { ConfirmationDialogComponent } from '@common/components/confirmation-dialog/confirmation-dialog.component';
import { MenuItemComponent } from '@common/components/menu-item/menu-item.component';
import { TimedFlag } from '@common/utils/timed-flag';
import { RoleGuardComponent, RoleGuardPipe } from '@features/reckoning/components/role-guard/role-guard.component';
import { UserRolePipe } from '@features/reckoning/pipes/user-role.pipe';
import { IUserWithRole } from '@shared/entities/user';
import { UserRole } from '@shared/enums/user-role';
import { SettingsService } from '../../settings.service';
import { EditUserPseudonymDialogComponent } from './edit-user-pseudonym-dialog/edit-user-pseudonym-dialog.component';
import { InviteLinkDialogComponent } from "./invite-link-dialog/invite-link-dialog.component";
import { RoleSelectorComponent } from './role-selector/role-selector.component';

@Component({
  selector: 'app-settings-users-section',
  imports: [
    ArdiumIconButtonModule,
    CardComponent,
    AvatarComponent,
    RoleSelectorComponent,
    MatMenuModule,
    MenuItemComponent,
    RoleGuardComponent,
    RoleGuardPipe,
    AsyncPipe,
    UserRolePipe,
    ArdIconUserEdit,
    ArdIconLogout,
    ConfirmationDialogComponent,
    CheckboxComponent,
    ArdIconEditLine,
    ArdiumStackModule,
    ArdiumInputModule,
    ArdiumSpinnerModule,
    EditUserPseudonymDialogComponent,
    MatTooltipModule,
    InviteLinkDialogComponent
],
  templateUrl: './users.section.html',
  styleUrl: './users.section.scss',
})
export class UsersSection {
  readonly settingsService = inject(SettingsService);
  readonly router = inject(Router);
  readonly UserRole = UserRole;

  readonly inviteLinkDialogOpen = model.required<boolean>();

  readonly userRoles = mapSignal<number, UserRole>();
  readonly userPseudonyms = mapSignal<number, string | null>();

  readonly isArchived = this.settingsService.isArchived;

  constructor() {
    effect(() => {
      const users = this.settingsService.users.value();
      if (!users) return;

      for (const user of users) {
        this.userRoles.setKey(user.id, user.role);
        this.userPseudonyms.setKey(user.id, user.displayName);
      }
    });
  }

  //! editing pseudonym
  readonly userToEditPseudonym = signal<IUserWithRole | null>(null);

  onEditUserPseudonym(user: IUserWithRole) {
    if (this.isArchived()) return;
    this.userToEditPseudonym.set(user);
  }

  onConfirmUserPseudonymChange(userId: number, newPseudonym: string) {
    if (this.isArchived()) return;
    this.settingsService.updateUserPseudonym(userId, newPseudonym).then(success => {
      if (!success) return;
      this.userToEditPseudonym.set(null);
    });
  }

  //! changing role
  readonly userToChangeRole = signal<IUserWithRole | null>(null);

  readonly dontShowChangeRoleDialog = new TimedFlag('dontShowChangeRoleDialog');

  onUserRoleChange(user: IUserWithRole, newRole: UserRole) {
    if (this.isArchived()) return;
    if (this.dontShowChangeRoleDialog.isActive()) {
      this.onConfirmUserRoleChange(user.id, newRole, false);
      return;
    }
    this.userToChangeRole.set(user);
    this.userRoles.setKey(user.id, newRole);
  }

  onConfirmUserRoleChange(userId: number, newRole: UserRole, dontShowAgain: boolean) {
    if (this.isArchived()) return;
    if (dontShowAgain) {
      this.dontShowChangeRoleDialog.setFlag();
    }
    this.settingsService.updateUserRole(userId, newRole).then(success => {
      if (!success) return;
      this.userToChangeRole.set(null);
    });
  }

  //! kicking or leaving
  readonly kickOrLeaveTooltipArchived = $localize`:@@common.archived-tooltip:To rozliczenie jest zarchiwizowane`;
  readonly kickOrLeaveTooltipOwner = $localize`:@@common.owner-cant-leave-tooltip:Właściciel nie może opuścić rozliczenia`;
  readonly kickOrLeaveTooltipSelf = $localize`:@@common.cant-kick-yourself-tooltip:Nie możesz wyrzucić samego siebie`;

  readonly userToKickOrLeave = signal<IUserWithRole | null>(null);

  readonly isUserToKickOrLeaveSelf = computed(() => {
    const user = this.userToKickOrLeave();
    if (!user) return false;
    return user.id === this.settingsService.currentUser()?.id;
  });

  readonly dontShowKickOrLeaveDialog = new TimedFlag('dontShowKickOrLeaveDialog');

  onUserKickOrLeave(user: IUserWithRole) {
    if (this.dontShowKickOrLeaveDialog.isActive()) {
      this.onConfirmUserKickOrLeave(user.id, false);
      return;
    }
    this.userToKickOrLeave.set(user);
  }

  onConfirmUserKickOrLeave(userId: number, dontShowAgain: boolean) {
    if (dontShowAgain) {
      this.dontShowKickOrLeaveDialog.setFlag();
    }
    this.settingsService.userKickOrLeave(userId).then(success => {
      if (!success) return;
      this.userToKickOrLeave.set(null);
      if (this.isUserToKickOrLeaveSelf()) {
        this.router.navigateByUrl('/');
      }
    });
  }
}
