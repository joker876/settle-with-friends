import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { ArdiumIconButtonModule } from "@ardium-ui/ui";
import { AvatarListComponent } from "@common/components/avatar-list/avatar-list.component";
import { BalanceComponent } from "@common/components/balance/balance.component";
import { CardComponent } from '@common/components/card/card.component';
import { GridColumnTemplateDirective, GridComponent, IColumnDef } from '@common/components/grid';
import { ArdIconChevronDown_2 } from "@common/icons/chevron-down-2.icon";
import { ITransaction } from '@shared/entities/transaction';

@Component({
  selector: 'app-transactions-section',
  imports: [CardComponent, GridComponent, GridColumnTemplateDirective, DatePipe, AvatarListComponent, BalanceComponent, ArdiumIconButtonModule, ArdIconChevronDown_2],
  templateUrl: './transactions-section.component.html',
  styleUrl: './transactions-section.component.scss',
})
export class TransactionsSectionComponent {
  readonly transactions = input.required<ITransaction[]>();

  readonly mainCurrency = input.required<string>();

  readonly GRID_COL_DEFS: IColumnDef[] = [
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
    },
    {
      heading: $localize`:@@reckoning-page.transactions.grid-heading.includees:Wliczani`,
      source: 'includees',
      templateName: 'userlist',
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
  ];
}
