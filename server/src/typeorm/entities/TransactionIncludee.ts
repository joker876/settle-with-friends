import { ITransaction } from '@shared/entities/transaction';
import { ITransactionIncludee } from '@shared/entities/transaction-includee';
import { IUser } from '@shared/entities/user';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Transaction } from './Transaction';
import { User } from './User';
import { cascade } from './utils';

@Entity({ name: 'transaction_includees' })
export class TransactionIncludee implements ITransactionIncludee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, cascade)
  @JoinColumn({ name: 'userId' })
  user: IUser;

  @Column()
  isEqualSplit: boolean;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  transactionId: number;

  @ManyToOne(() => Transaction, transaction => transaction.includees, cascade)
  @JoinColumn({ name: 'transactionId' })
  transaction: ITransaction;
}
