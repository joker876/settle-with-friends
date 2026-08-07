import { Component, inject, model } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ArdiumButtonModule,
  ArdiumDialogModule,
  ArdiumFormFieldModule,
  ArdiumInputModule,
  ArdiumNumberInputModule,
  ArdiumSpinnerModule,
  ArdiumStackModule,
} from '@ardium-ui/ui';
import { SelectComponent } from "@common/components/select/select.component";
import { SelectableOption } from '@common/utils/options';
import { InviteLinkService } from './invite-link.service';

@Component({
  selector: 'app-invite-link-dialog',
  imports: [
    ArdiumDialogModule,
    ArdiumButtonModule,
    ArdiumInputModule,
    ArdiumStackModule,
    ArdiumFormFieldModule,
    ArdiumSpinnerModule,
    ArdiumNumberInputModule,
    ReactiveFormsModule,
    SelectComponent
],
  templateUrl: './invite-link-dialog.component.html',
  styleUrl: './invite-link-dialog.component.scss',
  providers: [InviteLinkService],
})
export class InviteLinkDialogComponent {
  readonly inviteLinkService = inject(InviteLinkService);

  readonly open = model.required<boolean>();

  readonly form = new FormGroup({
    maxUses: new FormControl<number | null>(null, [Validators.required]),
    expiresInSeconds: new FormControl<number>(43200),
  });

  readonly EXPIRES_IN_OPTIONS: SelectableOption<number>[] = [
    { label: $localize`:@@settings.invite-link-dialog.expires-in.1-hour:1 godzina`, value: 3600 },
    { label: $localize`:@@settings.invite-link-dialog.expires-in.12-hours:12 godzin`, value: 43200 },
    { label: $localize`:@@settings.invite-link-dialog.expires-in.1-day:1 dzień`, value: 86400 },
    { label: $localize`:@@settings.invite-link-dialog.expires-in.3-day:3 dni`, value: 259200 },
    { label: $localize`:@@settings.invite-link-dialog.expires-in.1-week:1 tydzień`, value: 604800 },
  ];

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { maxUses, expiresInSeconds } = this.form.value;

    const expirationDate = new Date();
    expirationDate.setSeconds(expirationDate.getSeconds() + (expiresInSeconds ?? 0));

    this.inviteLinkService.createInviteLink(maxUses!, expirationDate).then(success => {
      if (success) {
        this.open.set(false);
      }
    });
  }
}
