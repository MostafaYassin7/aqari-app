import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from './user.entity';

export enum RatingReferenceType {
  BOOKING = 'booking',
  DEAL = 'deal',
}

@Entity('ratings')
@Unique(['reviewerId', 'referenceType', 'referenceId'])
@Index(['revieweeId'])
export class Rating extends BaseEntity {
  @Column({ type: 'uuid' })
  reviewerId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reviewerId' })
  reviewer!: User;

  @Column({ type: 'uuid' })
  revieweeId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'revieweeId' })
  reviewee!: User;

  @Column({ type: 'decimal', precision: 2, scale: 1 })
  score!: string;

  @Column({ type: 'text', nullable: true })
  comment!: string | null;

  @Column({ type: 'enum', enum: RatingReferenceType })
  referenceType!: RatingReferenceType;

  @Column({ type: 'uuid' })
  referenceId!: string;
}
