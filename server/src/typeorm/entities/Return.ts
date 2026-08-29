import { IReckoning } from '@shared/entities/reckoning';
import { IReturn } from '@shared/entities/return';
import { IUser } from '@shared/entities/user';
import { CurrencyCode } from '@shared/enums/currency-code';
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

@Entity({ name: 'returns' })
export class Return implements IReturn {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  currencyCode: CurrencyCode;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  currencyRate: number | null;

  @Column({ type: 'boolean', nullable: true })
  isCurrencyRateFromApi: boolean | null;

  @Column()
  returnDate: Date;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @Column()
  returnedByUserId: number;

  @ManyToOne(() => User, cascade)
  @JoinColumn({ name: 'returnedByUserId' })
  returnedBy: IUser;

  @Column()
  returnedToUserId: number;

  @ManyToOne(() => User, cascade)
  @JoinColumn({ name: 'returnedToUserId' })
  returnedTo: IUser;

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
