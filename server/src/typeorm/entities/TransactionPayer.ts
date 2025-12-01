import { ITransaction } from '@shared/entities/transaction';
import { ITransactionPayer } from '@shared/entities/transaction-payer';
import { IUser } from '@shared/entities/user';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Transaction } from './Transaction';
import { User } from './User';
import { cascade } from './utils';

@Entity({ name: 'transaction_payers' })
export class TransactionPayer implements ITransactionPayer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, cascade)
  @JoinColumn({ name: 'userId' })
  user: IUser;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount: number | null;

  transactionId: number;

  @ManyToOne(() => Transaction, transaction => transaction.payers, cascade)
  @JoinColumn({ name: 'transactionId' })
  transaction: ITransaction;
}
