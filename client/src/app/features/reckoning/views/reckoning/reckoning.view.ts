import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReckoningService } from '@features/reckoning/services/reckoning.service';
import { TransactionsService } from '@features/reckoning/services/transactions.service';
import { UsersService } from '@features/reckoning/services/users.service';
import { TransactionsSectionComponent } from './sections/transactions-section/transactions-section.component';

@Component({
  selector: 'app-reckoning',
  imports: [TransactionsSectionComponent],
  templateUrl: './reckoning.view.html',
  styleUrl: './reckoning.view.scss',
})
export class ReckoningView {
  readonly reckoningService = inject(ReckoningService);
  readonly transactionsService = inject(TransactionsService);
  readonly usersService = inject(UsersService);
  private readonly _router = inject(Router);
  private readonly _activatedRoute = inject(ActivatedRoute);

  navigateToCreateTransaction() {
    this._router.navigate(['create-transaction'], { relativeTo: this._activatedRoute });
  }
}
