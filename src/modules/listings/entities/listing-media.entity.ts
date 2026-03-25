import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { MediaType } from '../../../common/enums/media-type.enum';
import { Listing } from './listing.entity';

@Entity('listing_media')
export class ListingMedia extends BaseEntity {
  @Column({ type: 'uuid' })
  listingId!: string;

  @ManyToOne(() => Listing, (listing) => listing.media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'listingId' })
  listing!: Listing;

  @Column({ type: 'varchar' })
  url!: string;

  @Column({ type: 'enum', enum: MediaType })
  type!: MediaType;

  @Column({ type: 'boolean', default: false })
  isCover!: boolean;

  @Column({ type: 'integer', default: 0 })
  order!: number;
}
