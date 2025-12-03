import { computed, inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpService } from '@common/services/http-service';
import { hydrateAllInArray, hydrateSingleProp, MappingToken } from '@common/utils/hydration';
import { IUser } from '@shared/entities/user';
import { of } from 'rxjs';
import { ReckoningService } from './reckoning.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly _reckoningService = inject(ReckoningService);
  private readonly _http = inject(HttpService);

  private readonly _users = rxResource({
    request: () => ({ reckoningId: this._reckoningService.reckoningId() }),
    loader: ({ request }) =>
      request.reckoningId ? this._http.get<IUser[]>(['reckonings', request.reckoningId, 'users']) : of(undefined),
  });

  public readonly users = this._users.asReadonly();

  private readonly _userMap = computed(
    () =>
      this.users.value()?.reduce((map, user) => {
        map[user.id] = user;
        return map;
      }, {} as Record<number, IUser>) ?? {},
  );

  hydrateUsers<T extends Record<string, any>>(mappingTokens: MappingToken<T>[]): (objects: T[]) => T[] {
    return hydrateSingleProp<T, IUser>(mappingTokens, this._userMap());
  }

  hydrateUsersInArray<T extends Record<string, any>, A extends Record<string, any>>(
    arrayProp: keyof T,
    mappingTokens: MappingToken<A>[],
  ): (objects: T[]) => T[] {
    return hydrateAllInArray<T, A, IUser>(arrayProp, mappingTokens, this._userMap());
  }
}

export function singleUser<T extends Record<string, any>>(userProp: keyof T, idProp: keyof T): MappingToken<T> {
  return { isSingle: true, destProp: userProp, idProp };
}

export function multipleUsers<
  T extends Record<string, any>,
  A extends Record<string, any> = { user: IUser; userId: number },
>(arrayProp: keyof T, userProp: keyof A = 'user', idProp: keyof A = 'userId'): MappingToken<T> {
  return { isSingle: false, destProp: userProp, idProp, arrayProp } as MappingToken<T>;
}
