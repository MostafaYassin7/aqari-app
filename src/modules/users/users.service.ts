import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListingStatus } from '../../common/enums/listing-status.enum';
import { Deal } from '../crm/entities/deal.entity';
import { Listing } from '../listings/entities/listing.entity';
import { MediaService } from '../media/media.service';
import {
  NotificationReferenceType,
  NotificationType,
} from '../notifications/entities/notification.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateEstablishmentDto } from './dto/create-establishment.dto';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateEstablishmentDto } from './dto/update-establishment.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Establishment } from './entities/establishment.entity';
import { Rating, RatingReferenceType } from './entities/rating.entity';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(Establishment)
    private readonly establishmentsRepo: Repository<Establishment>,
    @InjectRepository(Rating)
    private readonly ratingsRepo: Repository<Rating>,
    @InjectRepository(Listing)
    private readonly listingsRepo: Repository<Listing>,
    @InjectRepository(Deal)
    private readonly dealsRepo: Repository<Deal>,
    private readonly mediaService: MediaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ─── FIND BY ID ───────────────────────────────────────────────────────────────

  async findById(id: string): Promise<User | null> {
    return this.usersRepo.findOne({
      where: { id, isActive: true },
      relations: { establishment: true },
    });
  }

  // ─── UPDATE LAST ACTIVE ───────────────────────────────────────────────────────

  updateLastActive(userId: string): void {
    this.usersRepo.update(userId, { lastActive: new Date() }).catch(() => null);
  }

  // ─── PUBLIC PROFILE ───────────────────────────────────────────────────────────

  async findPublicProfile(id: string): Promise<Record<string, unknown>> {
    const user = await this.usersRepo.findOne({
      where: { id, isActive: true },
      relations: { establishment: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const [avgResult, totalActiveListings, activeListings] = await Promise.all([
      this.ratingsRepo
        .createQueryBuilder('r')
        .select('AVG(CAST(r.score AS DECIMAL))', 'avg')
        .addSelect('COUNT(r.id)', 'count')
        .where('r.revieweeId = :id', { id })
        .getRawOne<{ avg: string | null; count: string }>(),
      this.listingsRepo.count({
        where: { ownerId: id, status: ListingStatus.PUBLISHED },
      }),
      this.listingsRepo.find({
        where: { ownerId: id, status: ListingStatus.PUBLISHED },
        select: {
          id: true,
          title: true,
          coverPhoto: true,
          totalPrice: true,
          city: true,
          area: true,
        },
        order: { createdAt: 'DESC' },
        take: 10,
      }),
    ]);

    const averageRating = avgResult?.avg
      ? Number(Number(avgResult.avg).toFixed(1))
      : 0;
    const totalRatings = Number(avgResult?.count ?? 0);

    return {
      id: user.id,
      name: user.name,
      profilePhoto: user.profilePhoto,
      role: user.role,
      bio: user.bio,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      lastActive: user.lastActive,
      establishment: user.establishment
        ? {
            name: user.establishment.name,
            nameAr: user.establishment.nameAr,
            logo: user.establishment.logo,
            isVerified: user.establishment.isVerified,
          }
        : null,
      averageRating,
      totalRatings,
      totalActiveListings,
      subscriptionBadge: null, // subscriptions module not yet implemented
      activeListings,
    };
  }

  // ─── UPDATE PROFILE ───────────────────────────────────────────────────────────

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.profilePhoto && user.profilePhoto && dto.profilePhoto !== user.profilePhoto) {
      this.mediaService.deleteFile(user.profilePhoto).catch(() => null);
    }

    await this.usersRepo.update(userId, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.email !== undefined && { email: dto.email }),
      ...(dto.bio !== undefined && { bio: dto.bio }),
      ...(dto.profilePhoto !== undefined && { profilePhoto: dto.profilePhoto }),
    });

    return this.usersRepo.findOneOrFail({ where: { id: userId } });
  }

  // ─── ESTABLISHMENT ────────────────────────────────────────────────────────────

  async getEstablishment(userId: string): Promise<Establishment | null> {
    return this.establishmentsRepo.findOne({ where: { ownerId: userId } });
  }

  async createEstablishment(
    userId: string,
    dto: CreateEstablishmentDto,
  ): Promise<Establishment> {
    const existing = await this.establishmentsRepo.findOne({ where: { ownerId: userId } });
    if (existing) {
      throw new ConflictException(
        'You already have an establishment. Use update to modify it.',
      );
    }

    const establishment = await this.establishmentsRepo.save(
      this.establishmentsRepo.create({
        ownerId: userId,
        name: dto.name,
        nameAr: dto.nameAr ?? null,
        commercialRecord: dto.commercialRecord ?? null,
        logo: dto.logo ?? null,
        isVerified: false,
      }),
    );

    await this.usersRepo.update(userId, { establishmentId: establishment.id });

    return establishment;
  }

  async updateEstablishment(
    userId: string,
    dto: UpdateEstablishmentDto,
  ): Promise<Establishment> {
    const establishment = await this.establishmentsRepo.findOne({
      where: { ownerId: userId },
    });
    if (!establishment) {
      throw new NotFoundException('No establishment found. Create one first.');
    }
    if (establishment.ownerId !== userId) {
      throw new ForbiddenException('Not your establishment');
    }

    if (dto.logo && establishment.logo && dto.logo !== establishment.logo) {
      this.mediaService.deleteFile(establishment.logo).catch(() => null);
    }

    await this.establishmentsRepo.update(establishment.id, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.nameAr !== undefined && { nameAr: dto.nameAr }),
      ...(dto.commercialRecord !== undefined && { commercialRecord: dto.commercialRecord }),
      ...(dto.logo !== undefined && { logo: dto.logo }),
    });

    return this.establishmentsRepo.findOneOrFail({ where: { id: establishment.id } });
  }

  // ─── RATINGS ─────────────────────────────────────────────────────────────────

  async createRating(reviewerId: string, dto: CreateRatingDto): Promise<Rating> {
    // 1. Cannot rate yourself
    if (reviewerId === dto.revieweeId) {
      throw new BadRequestException('You cannot rate yourself');
    }

    // 2. Validate reference
    if (dto.referenceType === RatingReferenceType.DEAL) {
      const deal = await this.dealsRepo.findOne({ where: { id: dto.referenceId } });
      if (!deal) throw new NotFoundException('Deal not found');
      if (deal.brokerId !== dto.revieweeId) {
        throw new ForbiddenException('This deal does not belong to this broker');
      }
    }
    // Note: booking validation will be added when Bookings module is implemented

    // 3. Check duplicate
    const duplicate = await this.ratingsRepo.findOne({
      where: {
        reviewerId,
        referenceType: dto.referenceType,
        referenceId: dto.referenceId,
      },
    });
    if (duplicate) {
      throw new ConflictException('You have already rated this transaction');
    }

    // 4. Create rating
    const rating = await this.ratingsRepo.save(
      this.ratingsRepo.create({
        reviewerId,
        revieweeId: dto.revieweeId,
        score: dto.score.toString(),
        comment: dto.comment ?? null,
        referenceType: dto.referenceType,
        referenceId: dto.referenceId,
      }),
    );

    // 5. Notify reviewee
    this.notificationsService
      .createAndSend(
        dto.revieweeId,
        NotificationType.NEW_RATING,
        'New Rating Received',
        `You received a ${dto.score}⭐ rating`,
        NotificationReferenceType.LISTING,
        dto.revieweeId,
      )
      .catch(() => null);

    return rating;
  }

  async getUserRatings(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{
    data: unknown[];
    total: number;
    page: number;
    pages: number;
    averageScore: number;
  }> {
    const [ratings, total] = await this.ratingsRepo.findAndCount({
      where: { revieweeId: userId },
      relations: { reviewer: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const averageScore = await this.calculateAverageRating(userId);

    const data = ratings.map((r) => ({
      id: r.id,
      score: Number(r.score),
      comment: r.comment,
      createdAt: r.createdAt,
      referenceType: r.referenceType,
      reviewer: {
        name: r.reviewer?.name ?? null,
        profilePhoto: r.reviewer?.profilePhoto ?? null,
      },
    }));

    return { data, total, page, pages: Math.ceil(total / limit), averageScore };
  }

  async calculateAverageRating(userId: string): Promise<number> {
    const result = await this.ratingsRepo
      .createQueryBuilder('r')
      .select('AVG(CAST(r.score AS DECIMAL))', 'avg')
      .where('r.revieweeId = :userId', { userId })
      .getRawOne<{ avg: string | null }>();

    return result?.avg ? Number(Number(result.avg).toFixed(1)) : 0;
  }
}
