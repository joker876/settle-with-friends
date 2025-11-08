import { IReckoning } from '@shared/entities/reckoning';
import { ITransaction, ITransactionUser } from '@shared/entities/transaction';
import { IUser } from '@shared/entities/user';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Reckoning } from './Reckoning';
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

  @ManyToOne(() => User, user => user.id, cascade)
  @JoinColumn({ name: 'createdByUserId' })
  createdBy: IUser;

  @Column()
  updatedByUserId: number;

  @ManyToOne(() => User, user => user.id, cascade)
  @JoinColumn({ name: 'updatedByUserId' })
  updatedBy: IUser;

  @ManyToOne(() => Reckoning, reckoning => reckoning.transactions, { nullable: false, ...cascade })
  @JoinColumn({ name: 'reckoningId' })
  reckoning: IReckoning;

  payers: ITransactionUser[];

  includees: ITransactionUser[];

  // @OneToMany(() => )
  // payers: ITransactionUser[];

  // includees: ITransactionUser[];
}
