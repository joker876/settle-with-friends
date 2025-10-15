import { IReckoning } from '@shared/entities/reckoning';
import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ReckoningUser } from './ReckoningUser';

@Entity({ name: 'reckonings' })
export class Reckoning implements IReckoning {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  name: string;

  @Column({ default: false })
  isArchived: boolean;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @OneToMany(() => ReckoningUser, reckoningUser => reckoningUser.reckoning)
  reckoningUsers: ReckoningUser[];
}
