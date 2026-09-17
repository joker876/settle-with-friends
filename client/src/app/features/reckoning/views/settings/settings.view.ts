import { Component, effect, inject, signal } from '@angular/core';
import { ArdIconCardboardBox, ArdIconCoins, ArdIconLink_2, ArdIconTrashCan_2, ArdIconUser_2 } from "@ardium-ui/icons";
import {
  ArdiumDialogModule,
  ArdiumGridModule,
  ArdiumIconButtonModule,
  ArdiumModalModule,
  ArdiumSpinnerModule,
  ArdiumStackModule,
} from '@ardium-ui/ui';
import { CardComponent } from '@common/components/card/card.component';
import { HeaderService } from '@common/services/header.service';
import { TitleService } from '@common/services/title.service';
import { RoleGuardComponent } from '@features/reckoning/components/role-guard/role-guard.component';
import { ReckoningService } from '@features/reckoning/services/reckoning.service';
import { UserRole } from '@shared/enums/user-role';
import { ArchivingSection } from './sections/archiving/archiving.section';
import { DeletingSection } from "./sections/deleting/deleting.section";
import { ReckoningSection } from "./sections/reckoning/reckoning.section";
import { UsersSection } from './sections/users/users.section';
import { SettingsService } from './settings.service';

@Component({
  selector: 'app-settings-view',
  imports: [
    ArdiumGridModule,
    ArdiumStackModule,
    ArdiumSpinnerModule,
    ArdiumIconButtonModule,
    ArdiumModalModule,
    UsersSection,
    CardComponent,
    ArchivingSection,
    RoleGuardComponent,
    ArdIconLink_2,
    ArdiumDialogModule,
    DeletingSection,
    ReckoningSection,
    ArdIconCoins,
    ArdIconUser_2,
    ArdIconCardboardBox,
    ArdIconTrashCan_2
],
  templateUrl: './settings.view.html',
  styleUrl: './settings.view.scss',
  providers: [SettingsService],
})
export class SettingsView {
  readonly reckoningService = inject(ReckoningService);
  readonly settingsService = inject(SettingsService);
  private readonly _headerService = inject(HeaderService);
  private readonly _titleService = inject(TitleService);
  readonly UserRole = UserRole;

  constructor() {
    effect(() => {
      const name = this.reckoningService.reckoning.value()?.name ?? null;
      this._headerService.setText(name);
      this._headerService.setGoBack('../');
      this._titleService.currentBaseTitle.set($localize`:@@titles.reckoning.settings:Ustawienia - ${name}`);
    });
  }

  readonly isInviteDialogOpen = signal<boolean>(false);
}
