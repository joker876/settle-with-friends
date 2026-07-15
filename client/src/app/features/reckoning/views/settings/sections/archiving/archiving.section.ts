import { Component, inject, signal } from '@angular/core';
import { ArdiumButtonModule } from '@ardium-ui/ui';
import { ConfirmationDialogComponent } from '@common/components/confirmation-dialog/confirmation-dialog.component';
import { ReckoningService } from '@features/reckoning/services/reckoning.service';
import { SettingsService } from '@features/reckoning/views/settings/settings.service';

@Component({
  selector: 'app-settings-archiving-section',
  imports: [ArdiumButtonModule, ConfirmationDialogComponent],
  templateUrl: './archiving.section.html',
  styleUrl: './archiving.section.scss',
})
export class ArchivingSection {
  readonly reckoningService = inject(ReckoningService);
  readonly settingsService = inject(SettingsService);

  readonly isArchived = this.settingsService.isArchived;

  readonly isArchiveDialogOpen = signal(false);

  toggleArchiving() {
    if (this.isArchived()) {
      this.settingsService.restoreReckoning();
    } else {
      this.isArchiveDialogOpen.set(true);
    }
  }

  onConfirmArchive() {
    this.settingsService.archiveReckoning();
    this.isArchiveDialogOpen.set(false);
  }
}
