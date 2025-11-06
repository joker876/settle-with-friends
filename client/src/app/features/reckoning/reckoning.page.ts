import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReckoningService } from './services/reckoning.service';
import { TransactionsService } from './services/transactions.service';
import { UsersService } from './services/users.service';

@Component({
  selector: 'app-reckoning',
  imports: [RouterModule],
  templateUrl: './reckoning.page.html',
  styleUrl: './reckoning.page.scss',
  providers: [ReckoningService, TransactionsService, UsersService],
})
export class ReckoningPage {
  readonly transactionsService = inject(TransactionsService);
  readonly usersService = inject(UsersService);
}
