import {
  Body,
  Controller,
  Delete,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { MediaService } from './media.service';

class DeleteFileDto {
  @IsString()
  url!: string;
}

@ApiTags('Media')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload multiple files to GCP (max 10)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
        folder: { type: 'string', example: 'listings' },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 20))
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('folder') folder: string = 'uploads',
  ) {
    const urls = await this.mediaService.uploadMultiple(files, folder);
    return { urls };
  }

  @Post('upload-single')
  @ApiOperation({ summary: 'Upload a single file to GCP' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folder: { type: 'string', example: 'avatars' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder: string = 'uploads',
  ) {
    const url = await this.mediaService.uploadFile(file, folder);
    return { url };
  }

  @Delete()
  @ApiOperation({ summary: 'Delete a file from GCP by URL' })
  async deleteFile(@Body() dto: DeleteFileDto) {
    await this.mediaService.deleteFile(dto.url);
    return { message: 'File deleted successfully' };
  }
}
