import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { RatingReferenceType } from '../entities/rating.entity';

export class CreateRatingDto {
  @ApiProperty()
  @IsUUID()
  revieweeId!: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  score!: number;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(500)
  @IsOptional()
  comment?: string;

  @ApiProperty({ enum: RatingReferenceType })
  @IsEnum(RatingReferenceType)
  referenceType!: RatingReferenceType;

  @ApiProperty()
  @IsUUID()
  referenceId!: string;
}
