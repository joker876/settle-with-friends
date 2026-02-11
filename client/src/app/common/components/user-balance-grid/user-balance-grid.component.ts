import { Component, computed, input, linkedSignal } from '@angular/core';
import { AvatarComponent } from '@common/components/avatar/avatar.component';
import { deduplicate } from '@common/utils/dedup';
import { expandToLabelValue } from '@common/utils/to-label-value';
import { IUser } from '@shared/entities/user';
import { BalanceComponent } from '../balance/balance.component';
import { SimpleSelectorComponent } from '../simple-selector/simple-selector.component';

export interface IUserBalanceGridItem {
  user: IUser;
  amount: number;
  currencyCode: string;
  currencyRate: number | null;
  isRemaining: boolean | null;
}

@Component({
  selector: 'app-user-balance-grid',
  imports: [AvatarComponent, BalanceComponent, SimpleSelectorComponent],
  templateUrl: './user-balance-grid.component.html',
  styleUrl: './user-balance-grid.component.scss',
})
export class UserBalanceGridComponent {
  readonly heading = input.required<string>();

  //! displaying users and values
  readonly usersAndValues = input.required<IUserBalanceGridItem[]>();

  private readonly _usersAndValuesWithMappedCurrencyByRate = computed<IUserBalanceGridItem[]>(() =>
    this.usersAndValues().map(v => ({
      ...v,
      amount: v.amount * (v.currencyRate ?? 1),
      currencyCode: this.mainCurrency(),
    })),
  );

  readonly usersAndValuesWithSelectedCurrency = computed<IUserBalanceGridItem[]>(() =>
    this.isMainCurrency() || this.mainCurrency() !== this.currentCurrency()
      ? this.usersAndValues()
      : this._usersAndValuesWithMappedCurrencyByRate(),
  );

  //! currency helpers
  readonly mainCurrency = input.required<string>();

  readonly isMainCurrency = computed<boolean>(() =>
    this.usersAndValues().some(v => v.currencyCode === this.mainCurrency()),
  );
  readonly helperCurrency = computed<string>(
    () => this.usersAndValues().find(v => v.currencyCode !== this.mainCurrency())?.currencyCode ?? this.mainCurrency(),
  );

  //! currency selector
  readonly currencyOptions = computed(() =>
    expandToLabelValue(deduplicate([this.mainCurrency(), this.helperCurrency()])),
  );
  readonly currentCurrency = linkedSignal<string>(() => this.mainCurrency());
}
