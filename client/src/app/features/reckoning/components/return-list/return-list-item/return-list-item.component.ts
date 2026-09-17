import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, model, output } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ArdIconChevron } from '@ardium-ui/icons';
import { ArdiumButtonModule, ArdiumIconButtonModule } from '@ardium-ui/ui';
import { BalanceComponent } from '@common/components/balance/balance.component';
import { CardComponent } from '@common/components/card/card.component';
import { StatisticRowComponent } from '@common/components/statistic-row/statistic-row.component';
import { StatisticWithValueComponent } from '@common/components/statistic-with-value/statistic-with-value.component';
import { StatisticComponent } from '@common/components/statistic/statistic.component';
import { AccessService } from '@features/reckoning/services/access.service';
import { IReturn } from '@shared/entities/return';
import { UserRole } from '@shared/enums/user-role';

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
    MatTooltipModule,
  ],
  templateUrl: './return-list-item.component.html',
  styleUrl: './return-list-item.component.scss',
})
export class ReturnListItemComponent {
  private readonly _accessService = inject(AccessService);

  readonly data = input.required<IReturn>();
  readonly isArchived = input.required<boolean>();
  readonly mainCurrency = input.required<string>();

  readonly isDetailsOpen = model<boolean>(false);

  readonly isDeleteLoading = input.required<boolean>();

  readonly editClick = output<void>();
  readonly deleteClick = output<void>();

  onShowDetailsClick() {
    this.isDetailsOpen.update(v => !v);
  }

  readonly areButtonsDisabled = computed<boolean>(
    () => this.isDeleteLoading() || this.isArchived() || !this.isUserAuthorizedToEdit(),
  );
  readonly disabledButtonTooltip = computed<string>(() =>
    this.isArchived()
      ? $localize`:@@common.archived-tooltip:To rozliczenie jest zarchiwizowane`
      : !this.isUserAuthorizedToEdit()
        ? $localize`:@@reckoning-page.returns.cannot-edit-not-own-returns:Nie możesz edytować nieswoich zwrotów`
        : '',
  );

  readonly amountInMainCurrency = computed<number>(() => this.data().amount * (this.data().currencyRate ?? 1));

  readonly amountInMainCurrencyText = computed<string>(
    () => $localize`:@@reckoning-page.returns.return.amount-in-main:Kwota w ${this.mainCurrency()}`,
  );

  readonly isUserAuthorizedToEdit = computed<boolean>(() => {
    return this._accessService.isUserAuthorizedOrSelf()(UserRole.Admin, [
      this.data().createdByUserId,
      this.data().returnedByUserId,
      this.data().returnedToUserId,
    ]);
  });
}
