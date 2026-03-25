import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { SearchListingsDto } from './search-listings.dto';

export class GeoSearchDto extends SearchListingsDto {
  @ApiProperty() @Type(() => Number) @IsNumber() latitude!: number;
  @ApiProperty() @Type(() => Number) @IsNumber() longitude!: number;

  @ApiPropertyOptional({ default: 5 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  radiusKm?: number = 5;
}
