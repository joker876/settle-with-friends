import { Component, inject, signal } from '@angular/core';
import { ArdiumButtonModule } from '@ardium-ui/ui';
import { SectionHeadingComponent } from "@common/components/section-heading/section-heading.component";
import { ArdIconPlus } from '@common/icons/plus.icon';
import { AuthService } from '@common/services/auth.service';
import { ReckoningsService } from '@features/main/services/reckonings.service';
import { ICreateReckoningRequestDto } from '@shared/contracts/reckonings/create';
import { IReckoning } from '@shared/entities/reckoning';
import { CreateReckoningDialogComponent } from './components/create-reckoning-dialog/create-reckoning-dialog.component';
import { ReckoningListItemComponent } from './components/reckoning-list-item/reckoning-list-item.component';

@Component({
  selector: 'app-reckoning-list',
  imports: [
    ReckoningListItemComponent,
    ArdiumButtonModule,
    ArdIconPlus,
    CreateReckoningDialogComponent,
    SectionHeadingComponent
],
  templateUrl: './reckoning-list.view.html',
  styleUrl: './reckoning-list.view.scss',
})
export class ReckoningListView {
  readonly authService = inject(AuthService);
  readonly reckoningsService = inject(ReckoningsService);

  onReckoningClick(reckoning: IReckoning) {
    console.log('clicked', reckoning);
  }

  //! creating
  readonly isCreateReckoningDialogOpen = signal<boolean>(false);

  onCreateReckoningClick() {
    this.isCreateReckoningDialogOpen.set(true);
  }
  async onCreateReckoningDialogSubmit(data: ICreateReckoningRequestDto) {
    const success = await this.reckoningsService.createReckoning(data);
    if (!success) return;
    this.isCreateReckoningDialogOpen.set(false);
  }
}
