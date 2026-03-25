import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { User } from '../users/entities/user.entity';
import { GeoSearchDto } from './dto/geo-search.dto';
import { GeoSearchProjectsDto } from './dto/geo-search-projects.dto';
import { SaveSearchDto } from './dto/save-search.dto';
import { SearchListingsDto } from './dto/search-listings.dto';
import { ToggleAlertDto } from './dto/toggle-alert.dto';
import { SearchService } from './search.service';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  // ─── PUBLIC SEARCH ───────────────────────────────────────────────────────────

  @Public()
  @Get()
  @ApiOperation({ summary: 'Search listings via Algolia' })
  search(@Query() dto: SearchListingsDto) {
    return this.searchService.searchListings(dto);
  }

  @Public()
  @Get('geo')
  @ApiOperation({ summary: 'Geo search listings via Algolia' })
  geoSearch(@Query() dto: GeoSearchDto) {
    return this.searchService.geoSearch(dto);
  }

  @Public()
  @Get('by-reference')
  @ApiOperation({ summary: 'Search by ad number or owner phone (PostgreSQL)' })
  @ApiQuery({ name: 'q', required: true })
  byReference(@Query('q') q: string) {
    return this.searchService.searchByAdOrPhone(q);
  }

  @Public()
  @Get('projects/geo')
  @ApiOperation({ summary: 'Geo search projects via Algolia' })
  geoSearchProjects(@Query() dto: GeoSearchProjectsDto) {
    return this.searchService.geoSearchProjects(dto);
  }

  // ─── SAVED SEARCHES ──────────────────────────────────────────────────────────

  @UseGuards(JwtGuard)
  @Post('saved')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save a search with filters' })
  saveSearch(@GetUser() user: User, @Body() dto: SaveSearchDto) {
    return this.searchService.saveSearch(user.id, dto);
  }

  @UseGuards(JwtGuard)
  @Get('saved')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all saved searches' })
  getSavedSearches(@GetUser() user: User) {
    return this.searchService.getSavedSearches(user.id);
  }

  @UseGuards(JwtGuard)
  @Delete('saved/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a saved search' })
  deleteSavedSearch(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.searchService.deleteSavedSearch(user.id, id);
  }

  @UseGuards(JwtGuard)
  @Patch('saved/:id/alert')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable or disable alert for a saved search' })
  toggleAlert(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ToggleAlertDto,
  ) {
    return this.searchService.toggleAlert(user.id, id, dto.enabled);
  }
}
