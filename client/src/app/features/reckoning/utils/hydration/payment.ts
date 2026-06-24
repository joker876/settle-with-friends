import { singleUser, UsersService } from '@features/reckoning/services/users.service';
import { IPayment } from '@shared/entities/payment';
import { map, OperatorFunction } from 'rxjs';

export function hydratePayment(usersService: UsersService, multi?: false): OperatorFunction<IPayment, IPayment>;
export function hydratePayment(usersService: UsersService, multi: true): OperatorFunction<IPayment[], IPayment[]>;
export function hydratePayment(
  usersService: UsersService,
  multi: boolean = false,
): OperatorFunction<IPayment, IPayment> | OperatorFunction<IPayment[], IPayment[]> {
  return multi
    ? map(
        usersService.hydrateUsers<IPayment>([
          singleUser('createdBy', 'createdByUserId'),
          singleUser('updatedBy', 'updatedByUserId'),
          singleUser('paidBy', 'paidByUserId'),
        ]),
      )
    : map(
        usersService.hydrateUsersSingle<IPayment>([
          singleUser('createdBy', 'createdByUserId'),
          singleUser('updatedBy', 'updatedByUserId'),
          singleUser('paidBy', 'paidByUserId'),
        ]),
      );
}
