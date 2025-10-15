import { IUser } from '@shared/entities/user';
import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ReckoningUser } from './ReckoningUser';

@Entity({ name: 'users' })
export class User implements IUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  email: string;

  @Column()
  displayName: string;

  @Column({ nullable: true })
  photo?: string;

  @Column({ default: false })
  registered: boolean;

  @OneToMany(() => ReckoningUser, reckoningUser => reckoningUser.user)
  reckoningUsers: ReckoningUser[];
}
