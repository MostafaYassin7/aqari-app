import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, Min } from 'class-validator';
import { UnitAvailability, UnitType } from '../entities/project-unit.entity';

export class CreateUnitDto {
  @ApiProperty({ enum: UnitType })
  @IsEnum(UnitType)
  unitType!: UnitType;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  area!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceFrom?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceTo?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  floor?: number;

  @ApiPropertyOptional({ enum: UnitAvailability })
  @IsOptional()
  @IsEnum(UnitAvailability)
  availability?: UnitAvailability;
}
