import { Component, effect, inject } from '@angular/core';
import { ArdIconXCircleFilled } from '@ardium-ui/icons';
import { ArdiumButtonModule, ArdiumSpinnerModule } from '@ardium-ui/ui';
import { AvatarListComponent } from '@common/components/avatar-list/avatar-list.component';
import { CardComponent } from '@common/components/card/card.component';
import { PluralComponent } from '@common/components/plural/plural.component';
import { TitleService } from '@common/services/title.service';
import { InviteService } from './invite.service';

@Component({
  selector: 'app-invite',
  imports: [
    CardComponent,
    AvatarListComponent,
    ArdiumButtonModule,
    PluralComponent,
    ArdiumSpinnerModule,
    ArdIconXCircleFilled,
  ],
  templateUrl: './invite.page.html',
  styleUrl: './invite.page.scss',
  providers: [InviteService],
})
export class InvitePage {
  readonly inviteService = inject(InviteService);
  private readonly _titleService = inject(TitleService);

  constructor() {
    effect(() => {
      this._titleService.currentBaseTitle.set($localize`:@@titles.invite:Zaproszenie do rozliczenia`);
    });
  }
}
