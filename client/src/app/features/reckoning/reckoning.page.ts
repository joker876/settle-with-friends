import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CurrencyRatesService } from './services/currency-rates.service';
import { ReckoningService } from './services/reckoning.service';
import { TransactionsService } from './services/transactions.service';
import { UsersService } from './services/users.service';
import { PaymentsService } from './views/reckoning/sections/payments-section/payments.service';

@Component({
  selector: 'app-reckoning',
  imports: [RouterModule],
  templateUrl: './reckoning.page.html',
  styleUrl: './reckoning.page.scss',
  providers: [ReckoningService, TransactionsService, UsersService, CurrencyRatesService, PaymentsService],
})
export class ReckoningPage {
  readonly reckoningService = inject(ReckoningService);
  readonly transactionsService = inject(TransactionsService);
  readonly usersService = inject(UsersService);
}
