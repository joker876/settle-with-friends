import { Component, effect, inject } from '@angular/core';
import { HeaderService } from '@common/services/header.service';
import { TitleService } from '@common/services/title.service';
import { ReturnListComponent } from '@features/reckoning/components/return-list/return-list.component';
import { ReckoningService } from '@features/reckoning/services/reckoning.service';
import { UsersService } from '@features/reckoning/services/users.service';
import { IReturn } from '@shared/entities/return';
import { ReturnListService } from './return-list.service';

@Component({
  selector: 'app-return-list-view',
  imports: [ReturnListComponent],
  templateUrl: './return-list.view.html',
  styleUrl: './return-list.view.scss',
  providers: [ReturnListService],
})
export class ReturnListView {
  readonly reckoningService = inject(ReckoningService);
  readonly returnListService = inject(ReturnListService);
  readonly usersService = inject(UsersService);
  private readonly _headerService = inject(HeaderService);
  private readonly _titleService = inject(TitleService);

  constructor() {
    effect(() => {
      const name = this.reckoningService.reckoning.value()?.name ?? null;
      this._headerService.setText(name);
      this._headerService.setGoBack('../');
      this._titleService.currentBaseTitle.set($localize`:@@titles.reckoning.returns:Zwroty - ${name}`);
    });
  }

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
