import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class PurchasePromotionDto {
  @ApiProperty()
  @IsUUID()
  listingId!: string;

  @ApiProperty()
  @IsUUID()
  promotionTypeId!: string;
}
