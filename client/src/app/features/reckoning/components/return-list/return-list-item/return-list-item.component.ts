import { DatePipe } from '@angular/common';
import { Component, computed, input, model, output } from '@angular/core';
import { ArdIconChevron } from '@ardium-ui/icons';
import { ArdiumButtonModule, ArdiumIconButtonModule } from '@ardium-ui/ui';
import { BalanceComponent } from '@common/components/balance/balance.component';
import { CardComponent } from '@common/components/card/card.component';
import { StatisticRowComponent } from '@common/components/statistic-row/statistic-row.component';
import { StatisticWithValueComponent } from '@common/components/statistic-with-value/statistic-with-value.component';
import { StatisticComponent } from '@common/components/statistic/statistic.component';
import { IReturn } from '@shared/entities/return';

@Component({
  selector: 'app-return-list-item',
  imports: [
    CardComponent,
    BalanceComponent,
    ArdiumIconButtonModule,
    ArdIconChevron,
    DatePipe,
    StatisticComponent,
    StatisticWithValueComponent,
    StatisticRowComponent,
    ArdiumButtonModule,
  ],
  templateUrl: './return-list-item.component.html',
  styleUrl: './return-list-item.component.scss',
})
export class ReturnListItemComponent {
  readonly data = input.required<IReturn>();
  readonly mainCurrency = input.required<string>();

  readonly isDetailsOpen = model<boolean>(false);

  readonly isDeleteLoading = input.required<boolean>();

  readonly editClick = output<void>();
  readonly deleteClick = output<void>();

  onShowDetailsClick() {
    this.isDetailsOpen.update(v => !v);
  }

  readonly amountInMainCurrency = computed<number>(() => this.data().amount * (this.data().currencyRate ?? 1));

  readonly amountInMainCurrencyText = computed<string>(
    () => $localize`:@@reckoning-page.returns.return.amount-in-main:Kwota w ${this.mainCurrency()}`,
  );
}
