import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Listing } from '../listings/entities/listing.entity';
import { EngagementController } from './engagement.controller';
import { EngagementService } from './engagement.service';
import { Favorite } from './entities/favorite.entity';
import { Like } from './entities/like.entity';
import { Report } from './entities/report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, Like, Report, Listing])],
  controllers: [EngagementController],
  providers: [EngagementService],
  exports: [EngagementService],
})
export class EngagementModule {}
