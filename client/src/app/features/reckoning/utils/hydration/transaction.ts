import { multipleUsers, singleUser, UsersService } from '@features/reckoning/services/users.service';
import { ITransaction } from '@shared/entities/transaction';
import { ITransactionSplitPart, ITransactionSplitPartIncludee } from '@shared/entities/transaction-includee';
import { ITransactionPayer } from '@shared/entities/transaction-payer';
import { map, OperatorFunction } from 'rxjs';

export function hydrateTransaction(
  usersService: UsersService,
  multi?: false,
): OperatorFunction<ITransaction, ITransaction>;
export function hydrateTransaction(
  usersService: UsersService,
  multi: true,
): OperatorFunction<ITransaction[], ITransaction[]>;
export function hydrateTransaction(
  usersService: UsersService,
  multi: boolean = false,
): OperatorFunction<ITransaction, ITransaction> | OperatorFunction<ITransaction[], ITransaction[]> {
  return multi
    ? map((obj: ITransaction[]) => {
        obj = usersService.hydrateUsers<ITransaction>([
          singleUser('createdBy', 'createdByUserId'),
          singleUser('updatedBy', 'updatedByUserId'),
          multipleUsers<ITransaction, ITransactionPayer>('payers'),
        ])(obj);

        obj = usersService.hydrateUsersInArray<ITransaction, ITransactionSplitPart>('splitParts', [
          multipleUsers<ITransactionSplitPart, ITransactionSplitPartIncludee>('includees'),
        ])(obj);

        return obj;
      })
    : map((obj: ITransaction) => {
        obj = usersService.hydrateUsersSingle<ITransaction>([
          singleUser('createdBy', 'createdByUserId'),
          singleUser('updatedBy', 'updatedByUserId'),
          multipleUsers<ITransaction, ITransactionPayer>('payers'),
        ])(obj);

        obj = usersService.hydrateUsersInArraySingle<ITransaction, ITransactionSplitPart>('splitParts', [
          multipleUsers<ITransactionSplitPart, ITransactionSplitPartIncludee>('includees'),
        ])(obj);

        return obj;
      });
}
