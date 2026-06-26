import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { BooleanLike, coerceBooleanProperty } from '@ardium-ui/devkit';
import { AccessService } from '@features/reckoning/services/access.service';
import { UserRole } from '@shared/enums/user-role';

@Component({
  selector: 'app-role-guard',
  imports: [CommonModule],
  template: '@if (isAllowed()) { <ng-content /> }',
  styles: ':host { display: block; }',
})
export class RoleGuardComponent {
  private readonly _accessService = inject(AccessService);

  readonly role = input.required<UserRole>();

  readonly isAllowed = computed(() => this._accessService.isUserAuthorized(this.role(), this.below()));

  readonly below = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });
}
