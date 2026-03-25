import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';
import { FavoriteTargetType } from '../entities/favorite.entity';

export class ToggleFavoriteDto {
  @ApiProperty({ enum: FavoriteTargetType, example: FavoriteTargetType.LISTING })
  @IsEnum(FavoriteTargetType)
  targetType!: FavoriteTargetType;

  @ApiProperty({ example: 'uuid-here' })
  @IsUUID()
  targetId!: string;
}
