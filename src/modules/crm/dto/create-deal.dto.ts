import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateDealDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  listingId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  buyerName!: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  dealValue!: number;

  @ApiProperty({ example: '2026-03-24' })
  @IsDateString()
  dealDate!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
