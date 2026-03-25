import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({ example: '+966501234567' })
  @IsString()
  @IsNotEmpty()
  phone!: string;
}
