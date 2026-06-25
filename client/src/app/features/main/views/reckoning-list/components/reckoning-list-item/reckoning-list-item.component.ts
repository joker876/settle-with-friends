import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { ArdIconUser_2 } from '@ardium-ui/icons';
import { ArdiumIconButtonModule } from "@ardium-ui/ui";
import { BalanceComponent } from "@common/components/balance/balance.component";
import { CardComponent } from "@common/components/card/card.component";
import { IReckoningTableData } from '@shared/contracts/reckonings/get-all';
import { PluralizePlComponent } from 'ngx-polish-number-to-words';
import { TimeagoModule } from 'ngx-timeago';

@Component({
  selector: 'app-reckoning-list-item',
  imports: [ArdIconUser_2, TimeagoModule, DatePipe, BalanceComponent, CardComponent, ArdiumIconButtonModule, PluralizePlComponent],
  templateUrl: './reckoning-list-item.component.html',
  styleUrl: './reckoning-list-item.component.scss',
})
export class ReckoningListItemComponent {
  readonly data = input.required<IReckoningTableData>();

  getLastUpdatedString(dateStr: string | null): string {
    return $localize`:@@reckoning-list-item.last-updated:Ostatnia aktualizacja: ${dateStr}`;
  }
}
