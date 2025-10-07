import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity({ name: 'users'})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  displayName: string;

  @Column({ nullable: true })
  photo?: string;
}