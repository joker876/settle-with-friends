import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PaymentsService } from './components/payment-list/payments.service';
import { TransactionsService } from './components/transaction-list/transactions.service';
import { BasicSummaryService } from './services/basic-summary.service';
import { CurrencyRatesService } from './services/currency-rates.service';
import { ReckoningService } from './services/reckoning.service';
import { UsersService } from './services/users.service';

@Component({
  selector: 'app-reckoning',
  imports: [RouterModule],
  templateUrl: './reckoning.page.html',
  styleUrl: './reckoning.page.scss',
  providers: [ReckoningService, TransactionsService, UsersService, CurrencyRatesService, PaymentsService, BasicSummaryService],
})
export class ReckoningPage {
  readonly reckoningService = inject(ReckoningService);
  readonly basicSummaryService = inject(BasicSummaryService);
  readonly usersService = inject(UsersService);
}
