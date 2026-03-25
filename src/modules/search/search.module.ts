import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from '../notifications/notifications.module';
import { Listing } from '../listings/entities/listing.entity';
import { SavedSearch } from './entities/saved-search.entity';
import { SearchAlert } from './entities/search-alert.entity';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Listing, SavedSearch, SearchAlert]),
    NotificationsModule,
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
