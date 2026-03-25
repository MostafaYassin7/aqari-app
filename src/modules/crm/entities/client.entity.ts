import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum ClientPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

@Entity('clients')
@Index(['brokerId'])
@Index(['priority'])
export class Client extends BaseEntity {
  @Column({ type: 'uuid' })
  brokerId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'brokerId' })
  broker!: User;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar' })
  phone!: string;

  @Column({ type: 'varchar', nullable: true })
  adNumber!: string | null;

  @Column({ type: 'enum', enum: ClientPriority, default: ClientPriority.MEDIUM })
  priority!: ClientPriority;

  @Column({ type: 'text', nullable: true })
  clientDesire!: string | null;

  @Column({ type: 'text', nullable: true })
  nextStep!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;
}
