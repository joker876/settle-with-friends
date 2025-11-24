import { Component, input, output } from '@angular/core';
import { ArdiumButtonModule, ArdiumIconButtonModule } from '@ardium-ui/ui';
import { SectionHeadingComponent } from '@common/components/section-heading/section-heading.component';
import { ArdIconPlus } from '@common/icons/plus.icon';
import { ITransaction } from '@shared/entities/transaction';
import { TransactionListItemComponent } from '../../components/transaction-list-item/transaction-list-item.component';

@Component({
  selector: 'app-transactions-section',
  imports: [
    ArdiumIconButtonModule,
    TransactionListItemComponent,
    SectionHeadingComponent,
    ArdiumButtonModule,
    ArdIconPlus,
  ],
  templateUrl: './transactions-section.component.html',
  styleUrl: './transactions-section.component.scss',
})
export class TransactionsSectionComponent {
  readonly transactions = input.required<ITransaction[]>();

  readonly mainCurrency = input.required<string>();

  readonly createTransactionClick = output<void>();
}
