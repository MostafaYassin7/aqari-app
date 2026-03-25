import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum ReportTargetType {
  LISTING = 'listing',
  USER = 'user',
}

export enum ReportReason {
  SPAM = 'spam',
  FRAUD = 'fraud',
  INAPPROPRIATE = 'inappropriate',
  DUPLICATE = 'duplicate',
  OTHER = 'other',
}

export enum ReportStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved',
}

@Entity('reports')
@Index(['targetType'])
@Index(['targetId'])
@Index(['status'])
export class Report extends BaseEntity {
  @Column({ type: 'uuid' })
  reporterId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporterId' })
  reporter!: User;

  @Column({ type: 'enum', enum: ReportTargetType })
  targetType!: ReportTargetType;

  @Column({ type: 'uuid' })
  targetId!: string;

  @Column({ type: 'enum', enum: ReportReason })
  reason!: ReportReason;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.PENDING })
  status!: ReportStatus;
}
