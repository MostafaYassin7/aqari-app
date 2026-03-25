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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { QueryProjectsDto } from './dto/query-projects.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { ProjectsService } from './projects.service';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // ─── CREATE ─────────────────────────────────────────────────────────────────

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.BROKER, UserRole.HOST)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'Project created' })
  create(@GetUser() user: User, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(user.id, dto);
  }

  // ─── LIST ────────────────────────────────────────────────────────────────────

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get paginated projects (filter by city/status)' })
  findAll(@Query() query: QueryProjectsDto) {
    return this.projectsService.findAll(query);
  }

  // ─── MY PROJECTS ─────────────────────────────────────────────────────────────

  @UseGuards(JwtGuard)
  @Get('my')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user's projects" })
  findMine(@GetUser() user: User, @Query() query: QueryProjectsDto) {
    return this.projectsService.findMine(user.id, query);
  }

  // ─── GET ONE ─────────────────────────────────────────────────────────────────

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID (with units + media)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.findById(id);
  }

  // ─── UPDATE ──────────────────────────────────────────────────────────────────

  @UseGuards(JwtGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a project (owner only)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, user.id, dto);
  }

  // ─── DELETE ──────────────────────────────────────────────────────────────────

  @UseGuards(JwtGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete a project (owner only)' })
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.projectsService.remove(id, user.id);
  }

  // ─── UNITS ───────────────────────────────────────────────────────────────────

  @UseGuards(JwtGuard)
  @Post(':id/units')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a unit to a project' })
  addUnit(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
    @Body() dto: CreateUnitDto,
  ) {
    return this.projectsService.addUnit(id, user.id, dto);
  }

  @UseGuards(JwtGuard)
  @Patch(':id/units/:unitId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a project unit' })
  updateUnit(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('unitId', ParseUUIDPipe) unitId: string,
    @GetUser() user: User,
    @Body() dto: UpdateUnitDto,
  ) {
    return this.projectsService.updateUnit(id, unitId, user.id, dto);
  }
}
