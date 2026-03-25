import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ListingStatus } from '../../../common/enums/listing-status.enum';

export class UpdateStatusDto {
  @ApiProperty({ enum: ListingStatus })
  @IsEnum(ListingStatus)
  status!: ListingStatus;
}
