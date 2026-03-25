import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { User } from '../users/entities/user.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { GetFavoritesDto } from './dto/get-favorites.dto';
import { ToggleFavoriteDto } from './dto/toggle-favorite.dto';
import { EngagementService } from './engagement.service';

@ApiTags('Engagement')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('engagement')
export class EngagementController {
  constructor(private readonly engagementService: EngagementService) {}

  // ─── FAVORITES ───────────────────────────────────────────────────────────────

  @Post('favorites')
  @ApiOperation({ summary: 'Toggle favorite on a listing or project' })
  @ApiResponse({ status: 201, description: '{ isFavorited: boolean }' })
  toggleFavorite(@GetUser() user: User, @Body() dto: ToggleFavoriteDto) {
    return this.engagementService.toggleFavorite(user.id, dto.targetType, dto.targetId);
  }

  @Get('favorites')
  @ApiOperation({ summary: 'Get paginated favorites' })
  @ApiResponse({ status: 200, description: 'Paginated favorites with card data' })
  getFavorites(@GetUser() user: User, @Query() query: GetFavoritesDto) {
    return this.engagementService.getFavorites(user.id, query);
  }

  // ─── LIKES ───────────────────────────────────────────────────────────────────

  @Post('likes/:listingId')
  @ApiOperation({ summary: 'Toggle like on a listing' })
  @ApiResponse({ status: 201, description: '{ isLiked: boolean }' })
  toggleLike(
    @GetUser() user: User,
    @Param('listingId', ParseUUIDPipe) listingId: string,
  ) {
    return this.engagementService.toggleLike(user.id, listingId);
  }

  // ─── REPORTS ─────────────────────────────────────────────────────────────────

  @Post('reports')
  @ApiOperation({ summary: 'Submit a report' })
  @ApiResponse({ status: 201, description: 'Report submitted' })
  createReport(@GetUser() user: User, @Body() dto: CreateReportDto) {
    return this.engagementService.createReport(user.id, dto);
  }

  // ─── STATUS ──────────────────────────────────────────────────────────────────

  @Get('status/:listingId')
  @ApiOperation({ summary: 'Get engagement status for a listing' })
  @ApiResponse({ status: 200, description: '{ isFavorited, isLiked }' })
  getStatus(
    @GetUser() user: User,
    @Param('listingId', ParseUUIDPipe) listingId: string,
  ) {
    return this.engagementService.getEngagementStatus(user.id, listingId);
  }
}
