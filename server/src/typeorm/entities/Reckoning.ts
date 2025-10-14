import { IReckoning } from '@shared/entities/reckoning';
import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ReckoningUser } from './ReckoningUser'; // Import the new join entity

@Entity({ name: 'reckonings' })
export class Reckoning implements IReckoning {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  name: string;

  @Column({ default: false })
  isArchived: boolean;

  @OneToMany(() => ReckoningUser, reckoningUser => reckoningUser.reckoning)
  reckoningUsers: ReckoningUser[];
}
