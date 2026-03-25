import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Client } from './client.entity';

@Entity('reminders')
@Index(['brokerId'])
@Index(['reminderAt'])
@Index(['isDone'])
export class Reminder extends BaseEntity {
  @Column({ type: 'uuid' })
  clientId!: string;

  @ManyToOne(() => Client, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client!: Client;

  @Column({ type: 'uuid' })
  brokerId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'brokerId' })
  broker!: User;

  @Column({ type: 'timestamp' })
  reminderAt!: Date;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @Column({ type: 'boolean', default: false })
  isDone!: boolean;
}
