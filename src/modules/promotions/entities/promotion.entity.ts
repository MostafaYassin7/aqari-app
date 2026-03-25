import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Listing } from '../../listings/entities/listing.entity';
import { User } from '../../users/entities/user.entity';
import { PromotionType } from './promotion-type.entity';

export enum PromotionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('promotions')
@Index(['listingId'])
@Index(['userId'])
@Index(['status'])
@Index(['expiresAt'])
export class Promotion extends BaseEntity {
  @Column({ type: 'uuid' })
  listingId!: string;

  @ManyToOne(() => Listing, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'listingId' })
  listing!: Listing;

  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'uuid' })
  promotionTypeId!: string;

  @ManyToOne(() => PromotionType, { eager: true })
  @JoinColumn({ name: 'promotionTypeId' })
  promotionType!: PromotionType;

  @Column({ type: 'enum', enum: PromotionStatus, default: PromotionStatus.ACTIVE })
  status!: PromotionStatus;

  @Column({ type: 'timestamp' })
  startsAt!: Date;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: string;
}
