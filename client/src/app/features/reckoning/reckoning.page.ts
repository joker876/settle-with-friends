import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReturnsService } from './components/return-list/returns.service';
import { TransactionsService } from './components/transaction-list/transactions.service';
import { AccessService } from './services/access.service';
import { CurrencyRatesService } from './services/currency-rates.service';
import { ReckoningService } from './services/reckoning.service';
import { UsersService } from './services/users.service';
import { BasicSummaryService } from './views/reckoning/basic-summary.service';

@Component({
  selector: 'app-reckoning',
  imports: [RouterModule],
  templateUrl: './reckoning.page.html',
  styleUrl: './reckoning.page.scss',
  providers: [
    ReckoningService,
    TransactionsService,
    UsersService,
    CurrencyRatesService,
    ReturnsService,
    BasicSummaryService,
    AccessService,
  ],
})
export class ReckoningPage {
  readonly reckoningService = inject(ReckoningService);
  readonly usersService = inject(UsersService);
}
