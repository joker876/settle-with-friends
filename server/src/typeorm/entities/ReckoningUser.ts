import { UserRole } from '@shared/enums/user-role';
import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Reckoning } from './Reckoning';
import { User } from './User';
import { cascade } from './utils';

@Entity({ name: 'reckonings_users' })
export class ReckoningUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reckoningId: number;

  @ManyToOne(() => Reckoning, reckoning => reckoning.reckoningUsers, cascade)
  @JoinColumn({ name: 'reckoningId' })
  reckoning: Reckoning;

  @Column()
  userId: number;

  @ManyToOne(() => User, user => user.reckoningUsers, cascade)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.Member })
  role: UserRole;

  @Column({ nullable: true })
  pseudonym?: string;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;
}
