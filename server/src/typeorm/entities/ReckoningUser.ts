import { UserRole } from '@shared/enums/user-role';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Reckoning } from './Reckoning';
import { User } from './User';

@Entity({ name: 'reckonings_users' })
export class ReckoningUser {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Reckoning, reckoning => reckoning.reckoningUsers)
  @JoinColumn({ name: 'reckoningId' })
  reckoning: Reckoning;

  @ManyToOne(() => User, user => user.reckoningUsers)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.Member })
  role: string;
}
