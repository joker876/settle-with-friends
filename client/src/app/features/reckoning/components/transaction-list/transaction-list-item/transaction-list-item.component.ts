import { DatePipe } from '@angular/common';
import { Component, computed, input, model, output } from '@angular/core';
import { ArdiumButtonModule, ArdiumIconButtonModule } from '@ardium-ui/ui';
import { BalanceComponent } from '@common/components/balance/balance.component';
import { CardComponent } from '@common/components/card/card.component';
import { StatisticRowComponent } from '@common/components/statistic-row/statistic-row.component';
import { StatisticWithIconComponent } from '@common/components/statistic-with-icon/statistic-with-icon.component';
import { StatisticWithValueComponent } from '@common/components/statistic-with-value/statistic-with-value.component';
import { StatisticComponent } from '@common/components/statistic/statistic.component';
import {
  IUserBalanceGridItem,
  UserBalanceGridComponent,
} from '@common/components/user-balance-grid/user-balance-grid.component';
import { ArdIconChevron } from '@common/icons/chevron.icon';
import { ArdIconUserArrowLeftIn_2 } from '@common/icons/user-arrow-left-in-2.icon';
import { ArdIconUserArrowRightOut_2 } from '@common/icons/user-arrow-right-out-2.icon';
import {
  transactionPayersToUserIncludeeData,
  transactionSplitPartsToUserIncludeeData,
} from '@features/reckoning/utils/split-parts-to-users';
import { ITransaction } from '@shared/entities/transaction';
import { PluralizePlComponent } from 'ngx-polish-number-to-words';

@Component({
  selector: 'app-transaction-list-item',
  imports: [
    CardComponent,
    BalanceComponent,
    ArdiumIconButtonModule,
    ArdIconChevron,
    DatePipe,
    ArdIconUserArrowRightOut_2,
    ArdIconUserArrowLeftIn_2,
    StatisticWithIconComponent,
    StatisticComponent,
    StatisticWithValueComponent,
    StatisticRowComponent,
    UserBalanceGridComponent,
    ArdiumButtonModule,
    PluralizePlComponent,
],
  templateUrl: './transaction-list-item.component.html',
  styleUrl: './transaction-list-item.component.scss',
})
export class TransactionListItemComponent {
  readonly data = input.required<ITransaction>();
  readonly mainCurrency = input.required<string>();

  readonly isDetailsOpen = model<boolean>(false);

  readonly isDeleteLoading = input.required<boolean>();

  readonly editClick = output<void>();
  readonly deleteClick = output<void>();

  onShowDetailsClick() {
    this.isDetailsOpen.update(v => !v);
  }

  readonly amountInMainCurrency = computed<number>(() => this.data().amount * (this.data().currencyRate ?? 1));

  readonly numberOfIncludees = computed<number>(
    // get list of unique user ids in the includees array
    () =>
      this.data().splitParts.reduce<Set<number>>((set, splitPart) => {
        splitPart.includees.forEach(v => set.add(v.userId));
        return set;
      }, new Set<number>()).size,
  );

  readonly amountInMainCurrencyText = computed<string>(
    () => $localize`:@@reckoning-page.transactions.transaction.amount-in-main:Kwota w ${this.mainCurrency()}`,
  );

  readonly payersAsUserData = computed<IUserBalanceGridItem[]>(() =>
    transactionPayersToUserIncludeeData(this.data().amount, this.data().payers).map(v => ({
      user: v.user,
      amount: v.totalAmount,
      isRemaining: v.isRemaining,
      currencyCode: this.data().currencyCode,
      currencyRate: this.data().currencyRate,
    })),
  );
  readonly splitPartsAsUserData = computed<IUserBalanceGridItem[]>(() =>
    transactionSplitPartsToUserIncludeeData(this.data().amount, this.data().splitParts).map(v => ({
      user: v.user,
      amount: v.totalAmount,
      currencyCode: this.data().currencyCode,
      currencyRate: this.data().currencyRate,
      isRemaining: v.isRemaining,
    })),
  );
}
