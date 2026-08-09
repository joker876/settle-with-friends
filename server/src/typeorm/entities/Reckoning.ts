import { IReckoning } from '@shared/entities/reckoning';
import { CurrencyCode } from '@shared/enums/currency-code';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { InviteLink } from './InviteLink';
import { ReckoningUser } from './ReckoningUser';
import { Return } from './Return';
import { Transaction } from './Transaction';

const helperCurrenciesTransformer = {
  to: (value?: string[] | null): string | null => {
    const currencies = (value ?? []).map(currency => currency.trim()).filter(Boolean);
    return currencies.length > 0 ? currencies.join(',') : null;
  },
  from: (value?: string | null): string[] =>
    (value ?? '')
      .split(',')
      .map(currency => currency.trim())
      .filter(Boolean),
};

@Entity({ name: 'reckonings' })
export class Reckoning implements IReckoning {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  name: string;

  @Column({ default: null, nullable: true, type: 'timestamp' })
  archivedAt: Date | null;

  @Column({ type: 'varchar' })
  mainCurrency: CurrencyCode;

  @Column({ name: 'helperCurrency', type: 'varchar', nullable: true, transformer: helperCurrenciesTransformer })
  helperCurrencies: CurrencyCode[];

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @DeleteDateColumn()
  deletedDate: Date;

  @OneToMany(() => ReckoningUser, reckoningUser => reckoningUser.reckoning)
  reckoningUsers: ReckoningUser[];

  @OneToMany(() => Transaction, transaction => transaction.reckoning)
  transactions: Transaction[];

  @OneToMany(() => Return, returnEntity => returnEntity.reckoning)
  returns: Return[];

  @OneToMany(() => InviteLink, inviteLink => inviteLink.reckoning)
  inviteLinks: InviteLink[];
}
