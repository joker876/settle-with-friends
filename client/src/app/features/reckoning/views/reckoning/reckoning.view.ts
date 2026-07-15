import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ArdIconBankCardPayment,
  ArdIconBankCardX,
  ArdIconChevron,
  ArdIconCoins,
  ArdIconHandCoins,
  ArdIconSettings,
} from '@ardium-ui/icons';
import { ArdiumGridModule, ArdiumIconButtonModule, ArdiumSpinnerModule, ArdiumStackModule } from '@ardium-ui/ui';
import { BalanceComponent } from '@common/components/balance/balance.component';
import { TextBtnComponent } from '@common/components/text-btn/text-btn.component';
import { LoadingBlockerDirective } from "@common/directives/loading-blocker.directive";
import { ReturnListComponent } from '@features/reckoning/components/return-list/return-list.component';
import { ReckoningService } from '@features/reckoning/services/reckoning.service';
import { UsersService } from '@features/reckoning/services/users.service';
import { IReturn } from '@shared/entities/return';
import { PluralizePlComponent } from 'ngx-polish-number-to-words';
import { SummaryCardComponent } from '../../components/summary-card/summary-card.component';
import { TransactionListComponent } from '../../components/transaction-list/transaction-list.component';
import { BasicSummaryService } from './basic-summary.service';
import { RecentReturnListService } from './recent-returns-list.service';
import { RecentTransactionListService } from './recent-transaction-list.service';

@Component({
  selector: 'app-reckoning-view',
  imports: [
    TransactionListComponent,
    ReturnListComponent,
    ArdiumGridModule,
    SummaryCardComponent,
    BalanceComponent,
    ArdiumSpinnerModule,
    PluralizePlComponent,
    ArdIconChevron,
    TextBtnComponent,
    ArdIconBankCardPayment,
    ArdIconHandCoins,
    ArdIconCoins,
    ArdIconBankCardX,
    ArdiumStackModule,
    ArdiumIconButtonModule,
    ArdIconSettings,
    LoadingBlockerDirective
],
  templateUrl: './reckoning.view.html',
  styleUrl: './reckoning.view.scss',
  providers: [RecentTransactionListService, RecentReturnListService],
})
export class ReckoningView {
  readonly reckoningService = inject(ReckoningService);
  readonly transactionListService = inject(RecentTransactionListService);
  readonly returnListService = inject(RecentReturnListService);
  readonly basicSummaryService = inject(BasicSummaryService);
  readonly usersService = inject(UsersService);
  private readonly _router = inject(Router);
  private readonly _activatedRoute = inject(ActivatedRoute);

  navigateToTransactions() {
    this._router.navigate(['transactions'], { relativeTo: this._activatedRoute });
  }
  navigateToReturns() {
    this._router.navigate(['returns'], { relativeTo: this._activatedRoute });
  }
  navigateToSummary() {
    this._router.navigate(['summary'], { relativeTo: this._activatedRoute });
  }
  navigateToSettings() {
    this._router.navigate(['settings'], { relativeTo: this._activatedRoute });
  }

  navigateToCreateTransaction() {
    if (this.reckoningService.isArchived()) return;
    this._router.navigate(['create-transaction'], { relativeTo: this._activatedRoute });
  }
  navigateToEditTransaction(transactionId: number) {
    if (this.reckoningService.isArchived()) return;
    this._router.navigate(['transaction', transactionId], { relativeTo: this._activatedRoute });
  }
  removeTransaction(transactionId: number) {
    if (this.reckoningService.isArchived()) return;
    this.transactionListService.removeTransaction(transactionId);
  }

  appendReturn(rtn: IReturn) {
    if (this.reckoningService.isArchived()) return;
    this.returnListService.appendReturn(rtn);
    this.basicSummaryService.reload({ returns: true });
  }
  refreshReturn(rtn: IReturn) {
    if (this.reckoningService.isArchived()) return;
    this.returnListService.refreshReturn(rtn);
    this.basicSummaryService.reload({ returns: true });
  }
  removeReturn(returnId: number) {
    if (this.reckoningService.isArchived()) return;
    this.returnListService.removeReturn(returnId);
    this.basicSummaryService.reload({ returns: true });
  }
}
