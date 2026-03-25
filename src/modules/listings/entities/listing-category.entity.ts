import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ListingType } from '../../../common/enums/listing-type.enum';
import { PropertyType } from '../../../common/enums/property-type.enum';

@Entity('listing_categories')
export class ListingCategory extends BaseEntity {
  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar' })
  nameAr!: string;

  @Column({ type: 'varchar', nullable: true })
  icon!: string | null;

  @Column({ type: 'enum', enum: PropertyType })
  propertyType!: PropertyType;

  @Column({ type: 'enum', enum: ListingType })
  listingType!: ListingType;

  @Column({ type: 'integer', default: 0 })
  sortOrder!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;
}
