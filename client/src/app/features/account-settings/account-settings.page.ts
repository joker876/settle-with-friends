import { Component, effect, inject, signal } from '@angular/core';
import { FileSystemMethod, FileSystemService } from '@ardium-ui/devkit';
import { ArdIconCheck, ArdIconPlus, ArdIconX_2 } from '@ardium-ui/icons';
import {
  ArdiumButtonModule,
  ArdiumDividerModule,
  ArdiumFormFieldModule,
  ArdiumGridModule,
  ArdiumInputModule,
  ArdiumSpinnerModule,
  ArdiumStackModule,
} from '@ardium-ui/ui';
import { AvatarComponent } from '@common/components/avatar/avatar.component';
import { CardComponent } from '@common/components/card/card.component';
import { ConfirmationDialogComponent } from '@common/components/confirmation-dialog/confirmation-dialog.component';
import { StatisticComponent } from '@common/components/statistic/statistic.component';
import { HeaderService } from '@common/services/header.service';
import { TitleService } from '@common/services/title.service';
import { AccountSettingsService } from './account-settings.service';

@Component({
  selector: 'app-account-settings',
  imports: [
    CardComponent,
    ArdiumButtonModule,
    ArdiumSpinnerModule,
    AvatarComponent,
    ArdIconPlus,
    StatisticComponent,
    ArdiumDividerModule,
    ArdiumFormFieldModule,
    ArdiumInputModule,
    ArdiumGridModule,
    ArdIconCheck,
    ArdIconX_2,
    ArdiumStackModule,
    ConfirmationDialogComponent,
  ],
  templateUrl: './account-settings.page.html',
  styleUrl: './account-settings.page.scss',
  providers: [AccountSettingsService],
})
export class AccountSettingsPage {
  readonly accountService = inject(AccountSettingsService);
  readonly fileSystemService = inject(FileSystemService);
  private readonly _headerService = inject(HeaderService);
  private readonly _titleService = inject(TitleService);

  constructor() {
    effect(() => {
      this._headerService.setText($localize`:@@titles.account-settings:Ustawienia konta`);
      this._headerService.setGoBack('/');
      this._titleService.currentBaseTitle.set($localize`:@@titles.account-settings:Ustawienia konta`);
    });
  }

  async onChangePhotoClick() {
    const data = this.accountService.accountData.value();
    if (!data) return;

    const file = (await this.fileSystemService.requestFileUpload({
      method: FileSystemMethod.PreferFileSystem,
      accept: ['.jpg', '.jpeg', '.png'],
    })) as File | null;

    if (!file) return;

    const fileAsBase64 = await this._resizeImageToBase64(file);

    this.accountService.updateAccountSettings({ photo: fileAsBase64, displayName: data.displayName });
  }

  private _resizeImageToBase64(file: File, maxWidth = 80, maxHeight = 80): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const img = new Image();

        img.onload = () => {
          const scale = Math.min(
            maxWidth / img.width,
            maxHeight / img.height,
            1, // don't upscale smaller images
          );

          const width = Math.round(img.width * scale);
          const height = Math.round(img.height * scale);

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Could not create canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          const base64 = canvas.toDataURL(file.type).split('base64,')[1];

          resolve(base64);
        };

        img.onerror = () => reject(new Error('Could not load image'));
        img.src = reader.result as string;
      };

      reader.onerror = () => reject(new Error('Could not read file'));
      reader.readAsDataURL(file);
    });
  }

  async onDeletePhotoClick() {
    const data = this.accountService.accountData.value();
    if (!data) return;

    this.accountService.updateAccountSettings({ photo: null, displayName: data.displayName });
  }

  //! display name
  readonly isEditingDisplayName = signal<boolean>(false);

  activateDisplayNameChange(target: HTMLInputElement) {
    this.isEditingDisplayName.set(true);

    target.focus();
  }

  onDisplayNameSave(target: HTMLInputElement): void {
    const data = this.accountService.accountData.value();
    if (!data) return;

    this.isEditingDisplayName.set(false);

    const value = target.value;

    this.accountService.updateAccountSettings({ displayName: value, photo: data.photo });
  }
  onDisplayNameCancel(target: HTMLInputElement): void {
    const data = this.accountService.accountData.value();
    if (!data) return;

    this.isEditingDisplayName.set(false);

    target.value = data.displayName;
  }

  //! deleting account
  readonly deleteAccountConfirmationOpen = signal<boolean>(false);

  onConfirmDeleteAccount() {
    this.accountService.deleteAccount();
    this.deleteAccountConfirmationOpen.set(false);
  }
}
