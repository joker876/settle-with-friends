import { ITransactionSplitPartIncludee, ITransactionSplitPartInternal } from '@shared/entities/transaction-includee';
import { IUser } from '@shared/entities/user';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TransactionSplitPart } from './TransactionSplitPart';
import { User } from './User';
import { cascade } from './utils';

@Entity({ name: 'transaction_split_part_includees' })
export class TransactionSplitPartIncludee implements ITransactionSplitPartIncludee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, cascade)
  @JoinColumn({ name: 'userId' })
  user: IUser;

  @Column()
  splitPartId: number;

  @ManyToOne(() => TransactionSplitPart, cascade)
  splitPart: ITransactionSplitPartInternal;
}
