import { IPayment } from '@shared/entities/payment';
import { IReckoning } from '@shared/entities/reckoning';
import { IUser } from '@shared/entities/user';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Reckoning } from './Reckoning';
import { User } from './User';

@Entity({ name: 'payments' })
export class Payment implements IPayment {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column()
  paymentDate: Date;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @OneToOne(() => User, user => user.id)
  @JoinColumn({ name: 'createdByUserId' })
  createdBy: IUser;

  @OneToOne(() => User, user => user.id)
  @JoinColumn({ name: 'updatedByUserId' })
  updatedBy: IUser;

  @OneToOne(() => User, user => user.id)
  @JoinColumn({ name: 'paidByUserId' })
  paidBy: IUser;

  @ManyToOne(() => Reckoning, reckoning => reckoning.transactions)
  reckoning: IReckoning;
}
