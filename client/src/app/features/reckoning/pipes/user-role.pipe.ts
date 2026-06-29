import { Pipe, PipeTransform } from '@angular/core';
import { UserRole } from '@shared/enums/user-role';

@Pipe({
  name: 'userRole',
  pure: true,
  standalone: true,
})
export class UserRolePipe implements PipeTransform {
  transform(value: UserRole | null | undefined): string {
    switch (value) {
      case UserRole.Owner:
        return $localize`:@@role.owner:Właściciel`;
      case UserRole.Admin:
        return $localize`:@@role.admin:Administrator`;
      case UserRole.Member:
        return $localize`:@@role.member:Uczestnik`;
      default:
        return $localize`:@@common.ERROR:BŁĄD`;
    }
  }
}
