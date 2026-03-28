import {
  Body,
  Controller,
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
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from './entities/user.entity';
import { CreateEstablishmentDto } from './dto/create-establishment.dto';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateEstablishmentDto } from './dto/update-establishment.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ─── PROFILE ─────────────────────────────────────────────────────────────────

  @UseGuards(JwtGuard)
  @Patch('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update my profile' })
  updateProfile(@GetUser() user: User, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  // ─── ESTABLISHMENT ────────────────────────────────────────────────────────────

  @UseGuards(JwtGuard)
  @Get('establishment')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my establishment' })
  async getEstablishment(@GetUser() user: User) {
    const establishment = await this.usersService.getEstablishment(user.id);
    return establishment ?? { exists: false };
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.BROKER, UserRole.OWNER, UserRole.HOST, UserRole.ADMIN)
  @Post('establishment')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create my establishment' })
  createEstablishment(@GetUser() user: User, @Body() dto: CreateEstablishmentDto) {
    return this.usersService.createEstablishment(user.id, dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.BROKER, UserRole.OWNER, UserRole.HOST, UserRole.ADMIN)
  @Patch('establishment')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update my establishment' })
  updateEstablishment(@GetUser() user: User, @Body() dto: UpdateEstablishmentDto) {
    return this.usersService.updateEstablishment(user.id, dto);
  }

  // ─── RATINGS ─────────────────────────────────────────────────────────────────

  @UseGuards(JwtGuard)
  @Post('ratings')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a rating' })
  createRating(@GetUser() user: User, @Body() dto: CreateRatingDto) {
    return this.usersService.createRating(user.id, dto);
  }

  // ─── PUBLIC PROFILE ───────────────────────────────────────────────────────────
  // NOTE: specific routes (/profile, /establishment, /ratings POST) must appear
  // BEFORE the /:id wildcard

  @Public()
  @Get(':id/ratings')
  @ApiOperation({ summary: "Get a user's ratings" })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getUserRatings(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.usersService.getUserRatings(
      id,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
    );
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get public profile' })
  findPublicProfile(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findPublicProfile(id);
  }
}
