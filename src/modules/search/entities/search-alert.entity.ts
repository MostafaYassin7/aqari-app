import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Listing } from '../../listings/entities/listing.entity';
import { User } from '../../users/entities/user.entity';
import { SavedSearch } from './saved-search.entity';

@Entity('search_alerts')
@Index(['userId'])
@Index(['isRead'])
@Index(['createdAt'])
export class SearchAlert extends BaseEntity {
  @Column({ type: 'uuid' })
  savedSearchId!: string;

  @ManyToOne(() => SavedSearch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'savedSearchId' })
  savedSearch!: SavedSearch;

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

  @Column({ type: 'boolean', default: false })
  isRead!: boolean;
}
