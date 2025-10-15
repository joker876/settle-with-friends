import { Component, inject } from '@angular/core';
import { ArdiumButtonModule } from "@ardium-ui/ui";
import { SectionCardComponent } from "@common/components/section-card/section-card.component";
import { TableComponent } from "@common/components/table/table.component";
import { ArdIconPlus } from "@common/icons/plus.icon";
import { AuthService } from '@common/services/auth.service';
import { ReckoningsService } from '@features/main/services/reckonings.service';
import { IReckoning } from '@shared/entities/reckoning';
import { ReckoningListItemComponent } from "./components/reckoning-list-item/reckoning-list-item.component";

@Component({
  selector: 'app-reckoning-list',
  imports: [ReckoningListItemComponent, SectionCardComponent, TableComponent, ArdiumButtonModule, ArdIconPlus],
  templateUrl: './reckoning-list.view.html',
  styleUrl: './reckoning-list.view.scss',
})
export class ReckoningListView {
  readonly authService = inject(AuthService);
  readonly reckoningsService = inject(ReckoningsService);

  onReckoningClick(reckoning: IReckoning) {
    console.log('clicked', reckoning);
  }
}
