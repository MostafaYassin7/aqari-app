import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Listing } from '../../listings/entities/listing.entity';
import { User } from '../../users/entities/user.entity';

@Entity('deals')
export class Deal extends BaseEntity {
  @Column({ type: 'uuid' })
  brokerId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'brokerId' })
  broker!: User;

  @Column({ type: 'uuid', nullable: true })
  listingId!: string | null;

  @ManyToOne(() => Listing, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'listingId' })
  listing!: Listing | null;

  @Column({ type: 'varchar' })
  buyerName!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  dealValue!: string;

  @Column({ type: 'date' })
  dealDate!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'boolean', default: false })
  isVerified!: boolean;
}
