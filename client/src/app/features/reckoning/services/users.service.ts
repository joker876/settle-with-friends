import { computed, inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpService } from '@common/services/http-service';
import { hydrateAllInArray, hydrateSingleProp, MappingToken } from '@common/utils/hydration';
import { ensureParams, isResourceResolved } from '@common/utils/resource';
import { bufferLastUntil } from '@common/utils/rxjs';
import { IUser } from '@shared/entities/user';
import { OperatorFunction } from 'rxjs';
import { ReckoningService } from './reckoning.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly _reckoningService = inject(ReckoningService);
  private readonly _http = inject(HttpService);

  private readonly _users = rxResource({
    params: () => ({ reckoningId: this._reckoningService.reckoningId() }),
    stream: ({ params }) =>
      ensureParams(params.reckoningId, this._http.get<IUser[]>(['reckonings', params.reckoningId!, 'users'])),
  });
  private readonly _usersResolved$ = isResourceResolved(this._users);

  public readonly users = this._users.asReadonly();

  private readonly _userMap = computed(
    () =>
      this.users.value()?.reduce((map, user) => {
        map[user.id] = user;
        return map;
      }, {} as Record<number, IUser>) ?? {},
  );

  waitForUsersLoaded<T extends Record<string, any>>(): OperatorFunction<T[], T[]> {
    return bufferLastUntil<T[]>(this._usersResolved$);
  }

  hydrateUsers<T extends Record<string, any>>(mappingTokens: MappingToken<T>[]): (objects: T[]) => T[] {
    return hydrateSingleProp<T, IUser>(mappingTokens, this._userMap);
  }

  hydrateUsersInArray<T extends Record<string, any>, A extends Record<string, any>>(
    arrayProp: keyof T,
    mappingTokens: MappingToken<A>[],
  ): (objects: T[]) => T[] {
    return hydrateAllInArray<T, A, IUser>(arrayProp, mappingTokens, this._userMap);
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
