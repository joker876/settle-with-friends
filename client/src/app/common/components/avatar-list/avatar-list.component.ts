import { Component, input } from '@angular/core';
import { coerceNumberProperty } from '@ardium-ui/devkit';
import { IUser } from '@shared/entities/user';

@Component({
  selector: 'app-avatar-list',
  imports: [],
  templateUrl: './avatar-list.component.html',
  styleUrl: './avatar-list.component.scss',
})
export class AvatarListComponent {
  readonly users = input.required<IUser>();

  readonly avatarLimit = input<number, any>(4, { transform: v => coerceNumberProperty(v, 4) });
}
