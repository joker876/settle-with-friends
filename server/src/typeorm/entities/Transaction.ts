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
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Reckoning } from './Reckoning';
import { User } from './User';

@Entity({ name: 'transactions' })
export class Transaction implements ITransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  name: string;

  @Column()
  amount: number;

  @Column()
  currencyCode: string;

  @Column({ nullable: true })
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

  @OneToOne(() => User, user => user.id)
  @JoinColumn({ name: 'createdByUserId' })
  createdBy: IUser;

  @Column()
  updatedByUserId: number;

  @OneToOne(() => User, user => user.id)
  @JoinColumn({ name: 'updatedByUserId' })
  updatedBy: IUser;

  @ManyToOne(() => Reckoning, reckoning => reckoning.transactions)
  reckoning: IReckoning;

  payers: ITransactionUser[];

  includees: ITransactionUser[];

  // @OneToMany(() => )
  // payers: ITransactionUser[];

  // includees: ITransactionUser[];
}
