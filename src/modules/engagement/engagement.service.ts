import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Listing } from '../listings/entities/listing.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { GetFavoritesDto } from './dto/get-favorites.dto';
import { FavoriteTargetType, Favorite } from './entities/favorite.entity';
import { Like } from './entities/like.entity';
import { Report } from './entities/report.entity';

@Injectable()
export class EngagementService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoritesRepo: Repository<Favorite>,
    @InjectRepository(Like)
    private readonly likesRepo: Repository<Like>,
    @InjectRepository(Report)
    private readonly reportsRepo: Repository<Report>,
    @InjectRepository(Listing)
    private readonly listingsRepo: Repository<Listing>,
  ) {}

  // ─── FAVORITES ───────────────────────────────────────────────────────────────

  async toggleFavorite(
    userId: string,
    targetType: FavoriteTargetType,
    targetId: string,
  ): Promise<{ isFavorited: boolean }> {
    const existing = await this.favoritesRepo.findOne({
      where: { userId, targetType, targetId },
    });

    if (existing) {
      await this.favoritesRepo.remove(existing);
      return { isFavorited: false };
    }

    const favorite = this.favoritesRepo.create({ userId, targetType, targetId });
    await this.favoritesRepo.save(favorite);
    return { isFavorited: true };
  }

  async getFavorites(
    userId: string,
    query: GetFavoritesDto,
  ): Promise<{ data: unknown[]; total: number; page: number }> {
    const { targetType = FavoriteTargetType.LISTING, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [favorites, total] = await this.favoritesRepo.findAndCount({
      where: { userId, targetType },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    let data: unknown[] = favorites;

    if (targetType === FavoriteTargetType.LISTING && favorites.length > 0) {
      const listingIds = favorites.map((f) => f.targetId);
      const listings = await this.listingsRepo
        .createQueryBuilder('l')
        .whereInIds(listingIds)
        .getMany();

      const listingMap = new Map(listings.map((l) => [l.id, l]));
      data = favorites.map((f) => ({
        favoriteId: f.id,
        favoritedAt: f.createdAt,
        listing: listingMap.get(f.targetId) ?? null,
      }));
    }

    return { data, total, page };
  }

  // ─── LIKES ───────────────────────────────────────────────────────────────────

  async toggleLike(
    userId: string,
    listingId: string,
  ): Promise<{ isLiked: boolean }> {
    const existing = await this.likesRepo.findOne({
      where: { userId, listingId },
    });

    if (existing) {
      await this.likesRepo.remove(existing);
      return { isLiked: false };
    }

    const like = this.likesRepo.create({ userId, listingId });
    await this.likesRepo.save(like);
    return { isLiked: true };
  }

  // ─── REPORTS ─────────────────────────────────────────────────────────────────

  async createReport(
    reporterId: string,
    dto: CreateReportDto,
  ): Promise<{ message: string }> {
    const report = this.reportsRepo.create({ reporterId, ...dto });
    await this.reportsRepo.save(report);
    return { message: 'Report submitted successfully' };
  }

  // ─── STATUS ──────────────────────────────────────────────────────────────────

  async getEngagementStatus(
    userId: string,
    listingId: string,
  ): Promise<{ isFavorited: boolean; isLiked: boolean }> {
    const [favorite, like] = await Promise.all([
      this.favoritesRepo.findOne({
        where: { userId, targetType: FavoriteTargetType.LISTING, targetId: listingId },
      }),
      this.likesRepo.findOne({ where: { userId, listingId } }),
    ]);

    return {
      isFavorited: !!favorite,
      isLiked: !!like,
    };
  }
}
