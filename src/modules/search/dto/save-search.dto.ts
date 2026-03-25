import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class SaveSearchDto {
  @ApiPropertyOptional({ example: 'Riyadh Apartments' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: { city: 'Riyadh', propertyType: 'apartment' },
    description: 'Any combination of SearchListingsDto fields (excluding page/limit/query)',
  })
  @IsObject()
  filters!: Record<string, unknown>;
}
