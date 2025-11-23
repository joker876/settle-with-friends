import { BreakpointObserver } from '@angular/cdk/layout';
import { DatePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ArdiumIconButtonModule } from '@ardium-ui/ui';
import { AvatarListComponent } from '@common/components/avatar-list/avatar-list.component';
import { BalanceComponent } from '@common/components/balance/balance.component';
import { CardComponent } from '@common/components/card/card.component';
import { GridColumnTemplateDirective, GridComponent, IColumnDef } from '@common/components/grid';
import { ArdIconChevronDown_2 } from '@common/icons/chevron-down-2.icon';
import { ITransaction } from '@shared/entities/transaction';
import { ITransactionPayer } from '@shared/entities/transaction-payer';
import { IUser } from '@shared/entities/user';
import { map, Subject, takeUntil } from 'rxjs';
import { TransactionListItemComponent } from "../../components/transaction-list-item/transaction-list-item.component";

@Component({
  selector: 'app-transactions-section',
  imports: [
    CardComponent,
    GridComponent,
    GridColumnTemplateDirective,
    DatePipe,
    AvatarListComponent,
    BalanceComponent,
    ArdiumIconButtonModule,
    ArdIconChevronDown_2,
    TransactionListItemComponent
],
  templateUrl: './transactions-section.component.html',
  styleUrl: './transactions-section.component.scss',
})
export class TransactionsSectionComponent {
  readonly destroyed = new Subject<void>();
  readonly isLargeScreen = toSignal(
    inject(BreakpointObserver)
      .observe('(width > 60rem)')
      .pipe(
        takeUntil(this.destroyed),
        map(result => result.matches),
      ),
  );

  readonly transactions = input.required<ITransaction[]>();

  readonly mainCurrency = input.required<string>();

  readonly GRID_COL_DEFS = computed<IColumnDef[]>(() => [
    {
      heading: $localize`:@@reckoning-page.transactions.grid-heading.date:Data`,
      source: 'transactionDate',
      templateName: 'date',
    },
    {
      heading: $localize`:@@reckoning-page.transactions.grid-heading.name:Nazwa`,
      source: 'name',
      templateName: 'name',
    },
    {
      heading: $localize`:@@reckoning-page.transactions.grid-heading.payers:Płacący`,
      source: 'payers',
      templateName: 'userlist',
      isHidden: !this.isLargeScreen(),
    },
    {
      heading: $localize`:@@reckoning-page.transactions.grid-heading.includees:Wliczani`,
      source: 'includees',
      // templateName: 'userlist',
      isHidden: !this.isLargeScreen(),
    },
    {
      heading: $localize`:@@reckoning-page.transactions.grid-heading.amount:Kwota`,
      source: 'amount',
      templateName: 'amount',
    },
    {
      heading: '',
      source: 'actions',
      templateName: 'actions',
    },
  ]);

  mapPayersIncludeesToUsers(payersOrIncludees: ITransactionPayer[]): IUser[] {
    return payersOrIncludees.map(v => v.user);
  }
}
