import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class CreateChatDto {
  @ApiProperty()
  @IsUUID()
  participantId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  listingId?: string;
}
