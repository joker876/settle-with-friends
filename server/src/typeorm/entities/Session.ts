import { ISession } from 'connect-typeorm';
import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

@Entity({ name: 'sessions' })
export class SessionEntity implements ISession {
  @PrimaryColumn({ length: 255 })
  id: string;

  @Index()
  @Column('bigint')
  expiredAt: number;

  @Column('text')
  json: string;

  @DeleteDateColumn()
  destroyedAt?: Date;
}
