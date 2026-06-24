import { Component, inject, input, output, signal } from '@angular/core';
import { BooleanLike, coerceBooleanProperty } from '@ardium-ui/devkit';
import { ArdiumButtonModule, ArdiumIconButtonModule } from '@ardium-ui/ui';
import { ConfirmationDialogComponent } from '@common/components/confirmation-dialog/confirmation-dialog.component';
import { MoneyComponent } from '@common/components/money/money.component';
import { SectionHeadingComponent } from '@common/components/section-heading/section-heading.component';
import { ArdIconPlus } from '@common/icons/plus.icon';
import { CurrencyRatesService } from '@features/reckoning/services/currency-rates.service';
import { ITransaction } from '@shared/entities/transaction';
import { TransactionListItemComponent } from './transaction-list-item/transaction-list-item.component';
import { TransactionsService } from './transactions.service';

@Component({
  selector: 'app-transaction-list',
  imports: [
    ArdiumIconButtonModule,
    TransactionListItemComponent,
    SectionHeadingComponent,
    ArdiumButtonModule,
    ArdIconPlus,
    ConfirmationDialogComponent,
    MoneyComponent,
  ],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.scss',
})
export class TransactionListComponent {
  private readonly _transactionsService = inject(TransactionsService);
  private readonly _currencyRatesService = inject(CurrencyRatesService);

  readonly transactions = input.required<ITransaction[]>();
  readonly partialList = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });
  readonly isDeleteLoading = this._transactionsService.deleteTransactionLoading;
  readonly mainCurrency = this._currencyRatesService.mainCurrency;

  readonly showAllButtonClick = output<void>();
  readonly createTransactionClick = output<void>();
  readonly editTransactionClick = output<number>();
  readonly deleteTransactionConfirm = output<number>();

  readonly transactionToBeDeleted = signal<ITransaction | null>(null);

  onDeleteTransactionClick(t: ITransaction): void {
    this.transactionToBeDeleted.set(t);
  }
  async onDeleteTransactionSubmit(id: number): Promise<void> {
    const success = await this._transactionsService.deleteTransaction(id);
    if (success) {
      this.deleteTransactionConfirm.emit(id);
      this.transactionToBeDeleted.set(null);
    }
  }
}
