import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  NEW_MESSAGE = 'new_message',
  BOOKING_UPDATE = 'booking_update',
  LISTING_APPROVED = 'listing_approved',
  LISTING_EXPIRED = 'listing_expired',
  SEARCH_ALERT = 'search_alert',
  PAYMENT_CONFIRMED = 'payment_confirmed',
  NEW_RATING = 'new_rating',
  SYSTEM = 'system',
}

export enum NotificationReferenceType {
  CHAT = 'chat',
  LISTING = 'listing',
  BOOKING = 'booking',
  SEARCH_ALERT = 'search_alert',
  PAYMENT = 'payment',
}

@Entity('notifications')
@Index(['userId'])
@Index(['isRead'])
@Index(['createdAt'])
@Index(['type'])
export class Notification extends BaseEntity {
  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'enum', enum: NotificationType })
  type!: NotificationType;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ type: 'boolean', default: false })
  isRead!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt!: Date | null;

  @Column({ type: 'enum', enum: NotificationReferenceType, nullable: true })
  referenceType!: NotificationReferenceType | null;

  @Column({ type: 'uuid', nullable: true })
  referenceId!: string | null;
}
