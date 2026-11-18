import { Pipe, PipeTransform } from '@angular/core';
import { IUserPublicData, IUserWithRole } from '@shared/entities/user';

export const DELETED_USER_DISPLAY_NAME = $localize`:@@common.deleted-user-display-name:[usunięte]`;
export const UNKNOWN_USER_DISPLAY_NAME = $localize`:@@common.unknown-user-display-name:[nieznany użytkownik]`;

@Pipe({
  name: 'username',
  pure: true,
  standalone: true,
})
export class UsernamePipe implements PipeTransform {
  transform(user: IUserWithRole | IUserPublicData | undefined): string {
    if (user && 'deletedAt' in user && user.deletedAt) {
      return DELETED_USER_DISPLAY_NAME;
    }
    return user?.displayName ?? UNKNOWN_USER_DISPLAY_NAME;
  }
}
