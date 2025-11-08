import { IReckoning } from '@shared/entities/reckoning';
import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Payment } from './Payment';
import { ReckoningUser } from './ReckoningUser';
import { Transaction } from './Transaction';

@Entity({ name: 'reckonings' })
export class Reckoning implements IReckoning {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  name: string;

  @Column({ default: false })
  isArchived: boolean;

  @Column()
  mainCurrency: string;

  @Column({ nullable: true })
  helperCurrency: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @OneToMany(() => ReckoningUser, reckoningUser => reckoningUser.reckoning)
  reckoningUsers: ReckoningUser[];

  @OneToMany(() => Transaction, transaction => transaction.reckoning)
  transactions: Transaction[];

  @OneToMany(() => Payment, payment => payment.reckoning)
  payments: Payment[];
}
