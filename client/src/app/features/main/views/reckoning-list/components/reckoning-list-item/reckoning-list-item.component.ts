import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { ArdiumIconButtonModule } from "@ardium-ui/ui";
import { BalanceComponent } from "@common/components/balance/balance.component";
import { CardComponent } from "@common/components/card/card.component";
import { ArdIconUser_2 } from "@common/icons/user-2.icon";
import { IReckoningTableData } from '@shared/contracts/reckonings/get-all';
import { PluralizePLPipe } from 'ngx-polish-number-to-words';
import { TimeagoModule } from 'ngx-timeago';

@Component({
  selector: 'app-reckoning-list-item',
  imports: [ArdIconUser_2, TimeagoModule, DatePipe, BalanceComponent, CardComponent, ArdiumIconButtonModule, PluralizePLPipe],
  templateUrl: './reckoning-list-item.component.html',
  styleUrl: './reckoning-list-item.component.scss',
})
export class ReckoningListItemComponent {
  readonly data = input.required<IReckoningTableData>();

  readonly PEOPLE1 = $localize`:@@people.plural.1:osoba`;
  readonly PEOPLE2 = $localize`:@@people.plural.2:osoby`
  readonly PEOPLE5 = $localize`:@@people.plural.5:osób`;

  getLastUpdatedString(dateStr: string | null): string {
    return $localize`:@@reckoning-list-item.last-updated:Ostatnia aktualizacja: ${dateStr}`;
  }
}
