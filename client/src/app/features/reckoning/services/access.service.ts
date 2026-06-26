import { effect, inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpService } from '@common/services/http-service';
import { ensureParams } from '@common/utils/resource';
import { UserRole, userRoleToInt } from '@shared/enums/user-role';
import { map } from 'rxjs';
import { ReckoningService } from './reckoning.service';

@Injectable()
export class AccessService {
  private readonly _http = inject(HttpService);
  private readonly _reckoningService = inject(ReckoningService);

  readonly userRole = rxResource({
    params: () => ({ id: this._reckoningService.reckoningId() }),
    stream: ({ params }) =>
      ensureParams(params.id, this._http.get<{ role: UserRole }, {}>(['reckonings', params.id!, 'role'])).pipe(
        map(v => v?.role),
      ),
  }).asReadonly();

  fdbhjf = effect(() => {
    console.log('User role changed:', this.userRole.value());
  });

  isUserAuthorized(requiredRole: UserRole, below = false): boolean {
    const userRole = this.userRole.value();
    if (!userRole) {
      return false;
    }
    const roleAsInt = userRoleToInt(userRole);
    const requiredRoleAsInt = userRoleToInt(requiredRole);
    return below ? roleAsInt < requiredRoleAsInt : roleAsInt >= requiredRoleAsInt;
  }
}
