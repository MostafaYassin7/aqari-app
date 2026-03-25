import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateEstablishmentDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  nameAr?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  commercialRecord?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  logo?: string;
}
