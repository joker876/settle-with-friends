import { Component, input } from '@angular/core';
import { BalanceComponent } from "@common/components/balance/balance.component";
import { ArdIconUser_2 } from "@common/icons/user-2.icon";
import { IReckoningTableData } from '@shared/contracts/reckonings/get-all';
import { TimeagoModule } from 'ngx-timeago';

@Component({
  selector: 'tr[app-reckoning-list-item]',
  imports: [ArdIconUser_2, TimeagoModule, BalanceComponent],
  templateUrl: './reckoning-list-item.component.html',
  styleUrl: './reckoning-list-item.component.scss',
})
export class ReckoningListItemComponent {
  readonly data = input.required<IReckoningTableData>();
}
