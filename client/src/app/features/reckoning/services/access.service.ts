import { computed, inject, Injectable } from '@angular/core';
import { rxResource, toObservable } from '@angular/core/rxjs-interop';
import { AuthService } from '@common/services/auth.service';
import { HttpService } from '@common/services/http-service';
import { ensureParams } from '@common/utils/resource';
import { UserRole, userRoleToInt } from '@shared/enums/user-role';
import { map } from 'rxjs';
import { ReckoningService } from './reckoning.service';

@Injectable()
export class AccessService {
  private readonly _http = inject(HttpService);
  private readonly _reckoningService = inject(ReckoningService);
  private readonly _authService = inject(AuthService);

  readonly userRole = rxResource({
    params: () => ({ id: this._reckoningService.reckoningId() }),
    stream: ({ params }) =>
      ensureParams(params.id, this._http.get<{ role: UserRole }, {}>(['reckonings', params.id!, 'role'])).pipe(
        map(v => v?.role),
      ),
  }).asReadonly();

  readonly currentUserId = computed(() => this._authService.userData()?.id);

  readonly isUserAuthorized = computed(() => {
    const userRole = this.userRole.value();

    return (requiredRole: UserRole | null) => {
      if (!requiredRole) return false;
      if (!userRole) {
        return false;
      }
      const roleAsInt = userRoleToInt(userRole);
      const requiredRoleAsInt = userRoleToInt(requiredRole);
      return roleAsInt >= requiredRoleAsInt;
    };
  });
  readonly isUserIdSelf = computed(() => {
    const currentUserId = this.currentUserId();

    return (userIds: number | number[] | null) => {
      if (!userIds) return false;

      if (!currentUserId) {
        return false;
      }
      if (Array.isArray(userIds)) {
        return userIds.includes(currentUserId);
      }
      return userIds === currentUserId;
    };
  });
  readonly isUserAuthorizedOrSelf = computed(() => {
    const isUserAuthorized = this.isUserAuthorized();
    const isUserIdSelf = this.isUserIdSelf();
    return (requiredRole: UserRole | null, userIds: number | number[] | null) =>
      isUserAuthorized(requiredRole) || isUserIdSelf(userIds ?? null);
  });

  readonly isUserAuthorizedObs = toObservable(this.isUserAuthorized);
  readonly isUserIdSelfObs = toObservable(this.isUserIdSelf);
  readonly isUserAuthorizedOrSelfObs = toObservable(this.isUserAuthorizedOrSelf);
}
