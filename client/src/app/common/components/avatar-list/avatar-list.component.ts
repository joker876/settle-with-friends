import { Component, computed, input } from '@angular/core';
import { coerceNumberProperty } from '@ardium-ui/devkit';
import { IUserPublicData } from '@shared/entities/user';
import { AvatarComponent } from "../avatar/avatar.component";

@Component({
  selector: 'app-avatar-list',
  imports: [AvatarComponent],
  templateUrl: './avatar-list.component.html',
  styleUrl: './avatar-list.component.scss',
  host: {
    '[style.--_avatar-list-length]': 'usersWithinLimit().length',
    '[style.--_avatar-list-max-length]': 'avatarLimit()',
  }
})
export class AvatarListComponent {
  readonly users = input.required<IUserPublicData[]>();

  readonly avatarLimit = input<number, any>(3, { transform: v => coerceNumberProperty(v, 3) });

  readonly usersWithinLimit = computed<IUserPublicData[]>(() => this.users().slice(0, this.avatarLimit()));
  readonly usersAboveLimit = computed<number>(() => this.users().length - this.avatarLimit());
}
