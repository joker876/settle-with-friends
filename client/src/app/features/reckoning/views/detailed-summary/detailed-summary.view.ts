import { Component, inject, signal } from '@angular/core';
import { ArdIconBankCardPayment, ArdIconChevron_2, ArdIconCoins, ArdIconHandCoins, ArdIconUsers } from '@ardium-ui/icons';
import { ArdiumGridModule, ArdiumIconButtonModule, ArdiumModalModule, ArdiumSpinnerModule, ArdiumStackModule } from '@ardium-ui/ui';
import { AvatarComponent } from '@common/components/avatar/avatar.component';
import { BackButtonComponent } from "@common/components/back-button/back-button.component";
import { BalanceComponent } from '@common/components/balance/balance.component';
import { CardComponent } from '@common/components/card/card.component';
import { StatisticComponent } from '@common/components/statistic/statistic.component';
import { SummaryCardComponent } from '@features/reckoning/components/summary-card/summary-card.component';
import { ReckoningService } from '@features/reckoning/services/reckoning.service';
import { IPersonalSummary } from '@shared/contracts/summary/get-detailed';
import { PluralizePlComponent } from 'ngx-polish-number-to-words';
import { DetailedSummaryService } from './detailed-summary.service';

@Component({
  selector: 'app-detailed-summary-view',
  imports: [
    ArdiumGridModule,
    ArdiumStackModule,
    SummaryCardComponent,
    BalanceComponent,
    ArdiumSpinnerModule,
    PluralizePlComponent,
    ArdIconUsers,
    ArdIconCoins,
    ArdIconHandCoins,
    ArdIconBankCardPayment,
    AvatarComponent,
    StatisticComponent,
    CardComponent,
    ArdIconChevron_2,
    ArdiumIconButtonModule,
    ArdiumModalModule,
    BackButtonComponent
],
  templateUrl: './detailed-summary.view.html',
  styleUrl: './detailed-summary.view.scss',
  providers: [DetailedSummaryService],
})
export class DetailedSummaryView {
  readonly reckoningService = inject(ReckoningService);
  readonly detailedSummaryService = inject(DetailedSummaryService);

  readonly userDetailsModalData = signal<IPersonalSummary | null>(null);
}
