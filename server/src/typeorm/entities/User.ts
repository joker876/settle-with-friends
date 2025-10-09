import { IUser } from '@shared/entities/user';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

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
}
