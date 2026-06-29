import { singleUser, UsersService } from '@features/reckoning/services/users.service';
import { IReturn } from '@shared/entities/return';
import { map, OperatorFunction } from 'rxjs';

export function hydrateReturn(usersService: UsersService, multi?: false): OperatorFunction<IReturn, IReturn>;
export function hydrateReturn(usersService: UsersService, multi: true): OperatorFunction<IReturn[], IReturn[]>;
export function hydrateReturn(
  usersService: UsersService,
  multi: boolean = false,
): OperatorFunction<IReturn, IReturn> | OperatorFunction<IReturn[], IReturn[]> {
  return multi
    ? map(
        usersService.hydrateUsers<IReturn>([
          singleUser('createdBy', 'createdByUserId'),
          singleUser('updatedBy', 'updatedByUserId'),
          singleUser('returnedBy', 'returnedByUserId'),
          singleUser('returnedTo', 'returnedToUserId'),
        ]),
      )
    : map(
        usersService.hydrateUsersSingle<IReturn>([
          singleUser('createdBy', 'createdByUserId'),
          singleUser('updatedBy', 'updatedByUserId'),
          singleUser('returnedBy', 'returnedByUserId'),
          singleUser('returnedTo', 'returnedToUserId'),
        ]),
      );
}
