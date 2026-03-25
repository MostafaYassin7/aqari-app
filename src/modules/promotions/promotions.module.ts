import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListingsModule } from '../listings/listings.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SearchModule } from '../search/search.module';
import { User } from '../users/entities/user.entity';
import { WalletModule } from '../wallet/wallet.module';
import { Promotion } from './entities/promotion.entity';
import { PromotionType } from './entities/promotion-type.entity';
import { PromotionsController } from './promotions.controller';
import { PromotionsService } from './promotions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Promotion, PromotionType, User]),
    WalletModule,
    ListingsModule,
    SearchModule,
    NotificationsModule,
  ],
  controllers: [PromotionsController],
  providers: [PromotionsService],
  exports: [PromotionsService],
})
export class PromotionsModule {}
