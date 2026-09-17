import { Component, effect, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderService } from '@common/services/header.service';
import { TitleService } from '@common/services/title.service';
import { TransactionListComponent } from '@features/reckoning/components/transaction-list/transaction-list.component';
import { ReckoningService } from '@features/reckoning/services/reckoning.service';
import { UsersService } from '@features/reckoning/services/users.service';
import { TransactionListService } from './transaction-list.service';

@Component({
  selector: 'app-transaction-list-view',
  imports: [TransactionListComponent],
  templateUrl: './transaction-list.view.html',
  styleUrl: './transaction-list.view.scss',
  providers: [TransactionListService],
})
export class TransactionListView {
  readonly reckoningService = inject(ReckoningService);
  readonly transactionListService = inject(TransactionListService);
  readonly usersService = inject(UsersService);
  private readonly _router = inject(Router);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _headerService = inject(HeaderService);
  private readonly _titleService = inject(TitleService);

  constructor() {
    effect(() => {
      const name = this.reckoningService.reckoning.value()?.name ?? null;
      this._headerService.setText(name);
      this._headerService.setGoBack('../');
      this._titleService.currentBaseTitle.set($localize`:@@titles.reckoning.transcations:Transakcje - ${name}`);
    });
  }

  navigateToCreateTransaction() {
    if (this.reckoningService.isArchived()) return;
    this._router.navigate(['create-transaction'], { relativeTo: this._activatedRoute });
  }
  navigateToEditTransaction(transactionId: number) {
    if (this.reckoningService.isArchived()) return;
    this._router.navigate(['transaction', transactionId], { relativeTo: this._activatedRoute });
  }
  removeTransaction(transactionId: number) {
    if (this.reckoningService.isArchived()) return;
    this.transactionListService.removeTransaction(transactionId);
  }
}
