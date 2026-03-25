import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ToggleAlertDto {
  @ApiProperty()
  @IsBoolean()
  enabled!: boolean;
}
