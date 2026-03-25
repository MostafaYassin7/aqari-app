import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateReminderDto {
  @ApiProperty()
  @IsDateString()
  reminderAt!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  note?: string;
}
