import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ClientPriority } from '../entities/client.entity';

export class InlineReminderDto {
  @ApiProperty()
  @IsDateString()
  reminderAt!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  note?: string;
}

export class CreateClientDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  adNumber?: string;

  @ApiPropertyOptional({ enum: ClientPriority })
  @IsEnum(ClientPriority)
  @IsOptional()
  priority?: ClientPriority;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  clientDesire?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  nextStep?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ type: InlineReminderDto })
  @ValidateNested()
  @Type(() => InlineReminderDto)
  @IsOptional()
  reminder?: InlineReminderDto;
}
