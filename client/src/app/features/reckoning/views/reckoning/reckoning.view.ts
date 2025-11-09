import { Component, inject } from '@angular/core';
import { BalanceComponent } from "@common/components/balance/balance.component";
import { SummaryCardComponent } from "@common/components/summary-card/summary-card.component";
import { ArdIconSave } from "@common/icons/save.icon";
import { ReckoningService } from '@features/reckoning/services/reckoning.service';
import { TransactionsService } from '@features/reckoning/services/transactions.service';
import { UsersService } from '@features/reckoning/services/users.service';

@Component({
  selector: 'app-reckoning',
  imports: [SummaryCardComponent, ArdIconSave, BalanceComponent],
  templateUrl: './reckoning.view.html',
  styleUrl: './reckoning.view.scss'
})
export class ReckoningView {
  readonly reckoningService = inject(ReckoningService);
  readonly transactionsService = inject(TransactionsService);
  readonly usersService = inject(UsersService);
}
