import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { FavoriteTargetType } from '../entities/favorite.entity';

export class GetFavoritesDto {
  @ApiPropertyOptional({ enum: FavoriteTargetType, default: FavoriteTargetType.LISTING })
  @IsOptional()
  @IsEnum(FavoriteTargetType)
  targetType?: FavoriteTargetType = FavoriteTargetType.LISTING;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
