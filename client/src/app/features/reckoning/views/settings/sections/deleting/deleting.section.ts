import { Component, inject, signal } from '@angular/core';
import { ArdiumButtonModule } from '@ardium-ui/ui';
import { ConfirmationDialogComponent } from '@common/components/confirmation-dialog/confirmation-dialog.component';
import { ReckoningService } from '@features/reckoning/services/reckoning.service';

@Component({
  selector: 'app-settings-deleting-section',
  imports: [ArdiumButtonModule, ConfirmationDialogComponent],
  templateUrl: './deleting.section.html',
  styleUrl: './deleting.section.scss',
})
export class DeletingSection {
  readonly reckoningService = inject(ReckoningService);

  readonly isDeleteDialogOpen = signal(false);

  deleteReckoning() {
    this.isDeleteDialogOpen.set(true);
  }

  onConfirmDelete() {
    this.reckoningService.deleteReckoning();
    this.isDeleteDialogOpen.set(false);
  }
}
