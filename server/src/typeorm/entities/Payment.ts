import { IPayment } from '@shared/entities/payment';
import { IReckoning } from '@shared/entities/reckoning';
import { IUser } from '@shared/entities/user';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Reckoning } from './Reckoning';
import { User } from './User';
import { cascade } from './utils';

@Entity({ name: 'payments' })
export class Payment implements IPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  currencyCode: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  currencyRate?: number;

  @Column({ nullable: true })
  isCurrencyRateFromApi?: boolean;

  @Column()
  paymentDate: Date;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @Column()
  paidByUserId: number;

  @ManyToOne(() => User, cascade)
  @JoinColumn({ name: 'paidByUserId' })
  paidBy: IUser;

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

  @ManyToOne(() => Reckoning, reckoning => reckoning.transactions)
  reckoning: IReckoning;
}
