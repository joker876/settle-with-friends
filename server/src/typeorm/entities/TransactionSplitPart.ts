import { ITransaction } from '@shared/entities/transaction';
import { ITransactionSplitPartIncludee, ITransactionSplitPartInternal } from '@shared/entities/transaction-includee';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Transaction } from './Transaction';
import { TransactionSplitPartIncludee } from './TransactionSplitPartIncludee';
import { cascade } from './utils';

@Entity({ name: 'transaction_split_parts' })
export class TransactionSplitPart implements ITransactionSplitPartInternal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'tinytext' })
  name: string;

  @Column({ type: 'double', nullable: true })
  amount: number | null;

  @OneToMany(() => TransactionSplitPartIncludee, includee => includee.splitPart, cascade)
  includees: ITransactionSplitPartIncludee[];

  transactionId: number;

  @ManyToOne(() => Transaction, transaction => transaction.splitParts, cascade)
  @JoinColumn({ name: 'transactionId' })
  transaction: ITransaction;
}
