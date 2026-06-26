import { CommonModule } from '@angular/common';
import { Component, model } from '@angular/core';
import { SelectComponent } from '@common/components/select/select.component';
import { StatisticComponent } from '@common/components/statistic/statistic.component';
import { RoleGuardComponent } from '@features/reckoning/components/role-guard/role-guard.component';
import { UserRole } from '@shared/enums/user-role';

@Component({
  selector: 'app-role-selector',
  imports: [RoleGuardComponent, SelectComponent, StatisticComponent, CommonModule],
  templateUrl: './role-selector.component.html',
  styleUrl: './role-selector.component.scss',
})
export class RoleSelectorComponent {
  readonly UserRole = UserRole;

  readonly userOptions = [
    { label: $localize`:@@role.admin:Administrator`, value: UserRole.Admin },
    { label: $localize`:@@role.member:Uczestnik`, value: UserRole.Member }
  ];

  readonly value = model<UserRole>(UserRole.Member);
}
