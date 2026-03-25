import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import {
  NotificationReferenceType,
  NotificationType,
} from '../notifications/entities/notification.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { ListingsService } from '../listings/listings.service';
import { SearchService } from '../search/search.service';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';
import { TransactionReferenceType } from '../wallet/entities/transaction.entity';
import { WalletService } from '../wallet/wallet.service';
import { Promotion, PromotionStatus } from './entities/promotion.entity';
import { PromotionType } from './entities/promotion-type.entity';

@Injectable()
export class PromotionsService {
  private readonly logger = new Logger(PromotionsService.name);

  constructor(
    @InjectRepository(Promotion)
    private readonly promotionsRepo: Repository<Promotion>,
    @InjectRepository(PromotionType)
    private readonly typesRepo: Repository<PromotionType>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly walletService: WalletService,
    private readonly listingsService: ListingsService,
    private readonly searchService: SearchService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ─── GET TYPES ───────────────────────────────────────────────────────────────

  async getActiveTypes(): Promise<PromotionType[]> {
    return this.typesRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  // ─── MY PROMOTIONS ───────────────────────────────────────────────────────────

  async getMyPromotions(userId: string): Promise<Promotion[]> {
    return this.promotionsRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  // ─── PURCHASE ────────────────────────────────────────────────────────────────

  async purchasePromotion(
    userId: string,
    listingId: string,
    promotionTypeId: string,
  ): Promise<Promotion> {
    // Load and verify listing ownership
    const listing = await this.listingsService.findById(listingId);
    if (listing.ownerId !== userId) {
      throw new ForbiddenException('You do not own this listing');
    }

    // Load promotion type
    const promotionType = await this.typesRepo.findOne({
      where: { id: promotionTypeId, isActive: true },
    });
    if (!promotionType) throw new NotFoundException('Promotion type not found or inactive');

    // Compute dates
    const startsAt = new Date();
    const expiresAt = new Date(
      startsAt.getTime() + promotionType.durationDays * 24 * 60 * 60 * 1000,
    );

    // Create promotion record to get its ID for the wallet reference
    const promotion = await this.promotionsRepo.save(
      this.promotionsRepo.create({
        listingId,
        userId,
        promotionTypeId,
        status: PromotionStatus.ACTIVE,
        startsAt,
        expiresAt,
        price: promotionType.price,
      }),
    );

    // Deduct from wallet — rollback promotion record if it fails
    try {
      await this.walletService.deduct(
        userId,
        Number(promotionType.price),
        TransactionReferenceType.PROMOTION,
        promotion.id,
        `Promotion: ${promotionType.name} for listing ${listing.adNumber}`,
      );
    } catch (err) {
      await this.promotionsRepo.delete(promotion.id);
      throw err;
    }

    // ── Handle each promotion code differently ──────────────────────────────

    if (promotionType.code === 'featured') {
      // Rank higher in search results
      await this.listingsService.activatePromotion(listingId, 'featured', expiresAt);

    } else if (promotionType.code === 'golden') {
      // Appears in golden section, unaffected by search filters
      await this.listingsService.activatePromotion(listingId, 'golden', expiresAt);

    } else if (promotionType.code === 'buyers_alert') {
      // Notify users whose saved searches match this listing
      this.searchService.checkNewListing(listing).catch(() => null);

    } else if (promotionType.code === 'social_media') {
      // Notify admin to handle social media promotion
      const admin = await this.usersRepo.findOne({ where: { role: UserRole.ADMIN } });
      if (admin) {
        this.notificationsService
          .createAndSend(
            admin.id,
            NotificationType.SYSTEM,
            'New Social Media Request',
            `Listing ${listing.adNumber} needs social media promotion.`,
            NotificationReferenceType.LISTING,
            listingId,
          )
          .catch(() => null);
      }
    }

    // Notify owner
    this.notificationsService
      .createAndSend(
        userId,
        NotificationType.PAYMENT_CONFIRMED,
        'Promotion activated successfully',
        `Your listing "${listing.title}" has been promoted with "${promotionType.name}".`,
        NotificationReferenceType.LISTING,
        listingId,
      )
      .catch(() => null);

    return promotion;
  }

  // ─── CANCEL ──────────────────────────────────────────────────────────────────

  async cancelPromotion(promotionId: string, userId: string): Promise<Promotion> {
    const promotion = await this.promotionsRepo.findOne({
      where: { id: promotionId },
      relations: { promotionType: true },
    });
    if (!promotion) throw new NotFoundException('Promotion not found');
    if (promotion.userId !== userId) throw new ForbiddenException('Not your promotion');
    if (promotion.status !== PromotionStatus.ACTIVE) {
      throw new BadRequestException('Promotion is not active');
    }

    promotion.status = PromotionStatus.CANCELLED;
    const updated = await this.promotionsRepo.save(promotion);

    const code = promotion.promotionType.code;
    if (code === 'featured' || code === 'golden') {
      await this.listingsService.deactivatePromotion(promotion.listingId);
    }

    return updated;
  }

  // ─── EXPIRE (CRON) ───────────────────────────────────────────────────────────

  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredPromotions(): Promise<void> {
    await this.expirePromotions();
  }

  async expirePromotions(): Promise<void> {
    const expired = await this.promotionsRepo.find({
      where: { status: PromotionStatus.ACTIVE, expiresAt: LessThan(new Date()) },
      relations: { promotionType: true },
    });

    if (expired.length === 0) return;

    this.logger.log(`Expiring ${expired.length} promotions`);

    await Promise.allSettled(
      expired.map(async (promotion) => {
        promotion.status = PromotionStatus.EXPIRED;
        await this.promotionsRepo.save(promotion);

        const code = promotion.promotionType.code;

        // Only featured and golden modify the listing record
        if (code === 'featured' || code === 'golden') {
          await this.listingsService.deactivatePromotion(promotion.listingId);
        }
        // buyers_alert and social_media: no listing changes needed

        this.notificationsService
          .createAndSend(
            promotion.userId,
            NotificationType.LISTING_EXPIRED,
            'Promotion expired',
            `Your "${promotion.promotionType.name}" promotion has expired.`,
            NotificationReferenceType.LISTING,
            promotion.listingId,
          )
          .catch(() => null);
      }),
    );
  }
}
