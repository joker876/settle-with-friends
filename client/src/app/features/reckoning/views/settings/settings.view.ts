import { Component, inject } from '@angular/core';
import {
  ArdiumGridModule,
  ArdiumIconButtonModule,
  ArdiumModalModule,
  ArdiumSpinnerModule,
  ArdiumStackModule,
} from '@ardium-ui/ui';
import { CardComponent } from '@common/components/card/card.component';
import { ReckoningService } from '@features/reckoning/services/reckoning.service';
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
  ],
  templateUrl: './settings.view.html',
  styleUrl: './settings.view.scss',
  providers: [SettingsService],
})
export class SettingsView {
  readonly reckoningService = inject(ReckoningService);
  readonly settingsService = inject(SettingsService);
}
