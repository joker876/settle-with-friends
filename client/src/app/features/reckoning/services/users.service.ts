import { computed, inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpService } from '@common/services/http-service';
import { MappingToken } from '@common/utils/hydration';
import { IUser } from '@shared/entities/user';
import { map, of, OperatorFunction } from 'rxjs';
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

  private _getUser(userId: number): IUser {
    return this._userMap()[userId];
  }

  private _mapUsersMutate<T extends Record<string, any>>(objects: T[], destProp: keyof T, idProp: keyof T): void {
    objects.forEach(v => (v[destProp] = this._userMap()[v[idProp]] as any));
  }

  hydrateUsers<T extends Record<string, any>>(mappingTokens: MappingToken<T>[]): OperatorFunction<T[], unknown> {
    return map(objects =>
      objects.map(v => {
        for (const token of mappingTokens) {
          if (token.isSingle) {
            v[token.destProp] = this._getUser(v[token.idProp]) as any;
            continue;
          }
          this._mapUsersMutate<T>(v[token.arrayProp!], token.destProp, token.idProp);
        }
        return v;
      }),
    );
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
