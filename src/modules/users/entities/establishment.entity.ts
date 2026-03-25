import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from './user.entity';

@Entity('establishments')
export class Establishment extends BaseEntity {
  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  nameAr!: string | null;

  @Column({ type: 'varchar', nullable: true })
  logo!: string | null;

  @Column({ type: 'varchar', nullable: true })
  commercialRecord!: string | null;

  @Column({ type: 'boolean', default: false })
  isVerified!: boolean;

  @Column({ type: 'uuid' })
  ownerId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner!: User;

  @OneToMany(() => User, (user) => user.establishment, { lazy: true })
  members!: Promise<User[]>;
}
