import { Component, inject } from '@angular/core';
import { BackButtonComponent } from "@common/components/back-button/back-button.component";
import { ReturnListComponent } from '@features/reckoning/components/return-list/return-list.component';
import { ReckoningService } from '@features/reckoning/services/reckoning.service';
import { UsersService } from '@features/reckoning/services/users.service';
import { IReturn } from '@shared/entities/return';
import { ReturnListService } from './return-list.service';

@Component({
  selector: 'app-return-list-view',
  imports: [ReturnListComponent, BackButtonComponent],
  templateUrl: './return-list.view.html',
  styleUrl: './return-list.view.scss',
  providers: [ReturnListService],
})
export class ReturnListView {
  readonly reckoningService = inject(ReckoningService);
  readonly returnListService = inject(ReturnListService);
  readonly usersService = inject(UsersService);

  appendReturn(rtn: IReturn) {
    if (this.reckoningService.isArchived()) return;
    this.returnListService.appendReturn(rtn);
  }
  refreshReturn(rtn: IReturn) {
    if (this.reckoningService.isArchived()) return;
    this.returnListService.refreshReturn(rtn);
  }
  removeReturn(returnId: number) {
    if (this.reckoningService.isArchived()) return;
    this.returnListService.removeReturn(returnId);
  }
}
