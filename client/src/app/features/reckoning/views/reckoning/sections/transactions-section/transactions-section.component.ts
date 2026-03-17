import { Component, input, output, signal } from '@angular/core';
import { ArdiumButtonModule, ArdiumIconButtonModule } from '@ardium-ui/ui';
import { ConfirmationDialogComponent } from "@common/components/confirmation-dialog/confirmation-dialog.component";
import { MoneyComponent } from "@common/components/money/money.component";
import { SectionHeadingComponent } from '@common/components/section-heading/section-heading.component';
import { ArdIconPlus } from '@common/icons/plus.icon';
import { ITransaction } from '@shared/entities/transaction';
import { TransactionListItemComponent } from './components/transaction-list-item/transaction-list-item.component';

@Component({
  selector: 'app-transactions-section',
  imports: [
    ArdiumIconButtonModule,
    TransactionListItemComponent,
    SectionHeadingComponent,
    ArdiumButtonModule,
    ArdIconPlus,
    ConfirmationDialogComponent,
    MoneyComponent
],
  templateUrl: './transactions-section.component.html',
  styleUrl: './transactions-section.component.scss',
})
export class TransactionsSectionComponent {
  readonly transactions = input.required<ITransaction[]>();

  readonly mainCurrency = input.required<string>();

  readonly isDeleteLoading = input.required<boolean>();

  readonly createTransactionClick = output<void>();
  readonly editTransactionClick = output<number>();
  readonly deleteTransactionConfirm = output<number>();

  readonly transactionToBeDeleted = signal<ITransaction | null>(null);

  onDeleteTransactionClick(t: ITransaction): void {
    this.transactionToBeDeleted.set(t);
  }
}
