import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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

  navigateToCreateTransaction() {
    this._router.navigate(['create-transaction'], { relativeTo: this._activatedRoute });
  }
  navigateToEditTransaction(transactionId: number) {
    this._router.navigate(['transaction', transactionId], { relativeTo: this._activatedRoute });
  }
  removeTransaction(transactionId: number) {
    this.transactionListService.removeTransaction(transactionId);
  }
}
