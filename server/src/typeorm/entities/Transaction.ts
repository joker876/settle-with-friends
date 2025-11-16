import { IReckoning } from '@shared/entities/reckoning';
import { ITransaction } from '@shared/entities/transaction';
import { ITransactionIncludee } from '@shared/entities/transaction-includee';
import { ITransactionPayer } from '@shared/entities/transaction-payer';
import { IUser } from '@shared/entities/user';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Reckoning } from './Reckoning';
import { TransactionIncludee } from './TransactionIncludee';
import { TransactionPayer } from './TransactionPayer';
import { User } from './User';
import { cascade } from './utils';

@Entity({ name: 'transactions' })
export class Transaction implements ITransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column()
  currencyCode: string;

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  currencyRate?: number;

  @Column({ nullable: true })
  isCurrencyRateFromApi?: boolean;

  @Column({ type: 'date' })
  transactionDate: Date;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @Column()
  createdByUserId: number;

  @ManyToOne(() => User, cascade)
  @JoinColumn({ name: 'createdByUserId' })
  createdBy: IUser;

  @Column()
  updatedByUserId: number;

  @ManyToOne(() => User, cascade)
  @JoinColumn({ name: 'updatedByUserId' })
  updatedBy: IUser;

  @ManyToOne(() => Reckoning, reckoning => reckoning.transactions, { nullable: false, ...cascade })
  @JoinColumn({ name: 'reckoningId' })
  reckoning: IReckoning;

  @OneToMany(() => TransactionPayer, payer => payer.transaction, cascade)
  payers: ITransactionPayer[];

  @OneToMany(() => TransactionIncludee, includee => includee.transaction, cascade)
  includees: ITransactionIncludee[];
}
