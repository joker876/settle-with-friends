import { IInviteLink } from '@shared/entities/invite-link';
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Reckoning } from './Reckoning';
import { User } from './User';
import { cascade } from './utils';

@Entity({ name: 'invite_links' })
export class InviteLink implements IInviteLink {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  token: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column()
  uses: number;

  @Column()
  usesLeft: number;

  @Column({ type: 'timestamp', nullable: true, default: null })
  lastUsedAt: Date | null;

  @Column()
  reckoningId: number;

  @CreateDateColumn()
  createdDate: Date;

  @Column()
  createdByUserId: number;

  @ManyToOne(() => User, cascade)
  @JoinColumn({ name: 'createdByUserId' })
  createdBy: User;

  @ManyToOne(() => Reckoning, reckoning => reckoning.inviteLinks, { nullable: false, ...cascade })
  @JoinColumn({ name: 'reckoningId' })
  reckoning: Reckoning;
}
