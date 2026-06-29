import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject, input, Pipe, PipeTransform } from '@angular/core';
import { AccessService } from '@features/reckoning/services/access.service';
import { UserRole } from '@shared/enums/user-role';
import { map, Observable } from 'rxjs';

@Pipe({
  name: 'roleGuard',
  standalone: true,
})
export class RoleGuardPipe implements PipeTransform {
  private readonly _accessService = inject(AccessService);

  transform({
    role,
    userId = null,
  }: {
    role?: UserRole | null;
    userId?: number | number[] | null;
  }): Observable<boolean> {
    return this._accessService.isUserAuthorizedOrSelfObs.pipe(map(fn => fn(role ?? null, userId ?? null)));
  }
}

@Component({
  selector: 'app-role-guard',
  imports: [CommonModule, RoleGuardPipe, AsyncPipe],
  template: `@if ({ role: role(), userId: userId() } | roleGuard | async) {
      <ng-content />
    } @else {
      <ng-content select="else" />
    }`,
  styles: ':host { display: block; }',
})
export class RoleGuardComponent {
  readonly role = input.required<UserRole | null>();
  readonly userId = input<number | number[] | null>(null);
}
