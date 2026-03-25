import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { algoliasearch, type SearchClient } from 'algoliasearch';
import { User } from '../users/entities/user.entity';
import { Listing } from './entities/listing.entity';

@Injectable()
export class ListingsAlgoliaService {
  private readonly client: SearchClient;
  private readonly indexName: string;
  private readonly logger = new Logger(ListingsAlgoliaService.name);

  constructor(private readonly config: ConfigService) {
    this.client = algoliasearch(
      config.get<string>('ALGOLIA_APP_ID')!,
      config.get<string>('ALGOLIA_API_KEY')!,
    );
    this.indexName = config.get<string>('ALGOLIA_LISTINGS_INDEX')!;
  }

  buildObject(listing: Listing, owner?: User | null) {
    return {
      objectID: listing.id,
      title: listing.title,
      description: listing.description,
      status: listing.status,
      adNumber: listing.adNumber,
      propertyType: listing.propertyType,
      listingType: listing.listingType,
      categoryName: listing.category?.name ?? null,
      totalPrice: Number(listing.totalPrice),
      pricePerMeter: listing.pricePerMeter ? Number(listing.pricePerMeter) : null,
      area: Number(listing.area),
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      livingRooms: listing.livingRooms,
      city: listing.city,
      district: listing.district,
      _geoloc: {
        lat: Number(listing.latitude),
        lng: Number(listing.longitude),
      },
      isFurnished: listing.isFurnished,
      hasElevator: listing.hasElevator,
      hasWater: listing.hasWater,
      hasElectricity: listing.hasElectricity,
      coverPhoto: listing.coverPhoto,
      ownerName: owner?.name ?? null,
      ownerPhoto: owner?.profilePhoto ?? null,
      createdAt: Math.floor(new Date(listing.createdAt).getTime() / 1000),
      isPromoted: listing.isPromoted,
      isGolden: listing.isGolden,
      promotionType: listing.promotionType ?? null,
      promotionExpiresAt: listing.promotionExpiresAt
        ? Math.floor(new Date(listing.promotionExpiresAt).getTime() / 1000)
        : null,
    };
  }

  async indexListing(listing: Listing, owner?: User | null): Promise<void> {
    try {
      await this.client.saveObject({
        indexName: this.indexName,
        body: this.buildObject(listing, owner),
      });
    } catch (err) {
      this.logger.error(`Algolia indexListing failed for ${listing.id}`, err);
    }
  }

  async updateListing(
    id: string,
    partial: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.client.partialUpdateObject({
        indexName: this.indexName,
        objectID: id,
        attributesToUpdate: partial,
        createIfNotExists: false,
      });
    } catch (err) {
      this.logger.error(`Algolia updateListing failed for ${id}`, err);
    }
  }

  async deleteListing(id: string): Promise<void> {
    try {
      await this.client.deleteObject({ indexName: this.indexName, objectID: id });
    } catch (err) {
      this.logger.error(`Algolia deleteListing failed for ${id}`, err);
    }
  }
}
