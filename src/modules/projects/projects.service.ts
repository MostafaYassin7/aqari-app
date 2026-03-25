import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { QueryProjectsDto } from './dto/query-projects.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { ProjectMedia } from './entities/project-media.entity';
import { Project } from './entities/project.entity';
import { ProjectUnit } from './entities/project-unit.entity';
import { ProjectsAlgoliaService } from './projects-algolia.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepo: Repository<Project>,
    @InjectRepository(ProjectUnit)
    private readonly unitsRepo: Repository<ProjectUnit>,
    @InjectRepository(ProjectMedia)
    private readonly mediaRepo: Repository<ProjectMedia>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly algolia: ProjectsAlgoliaService,
  ) {}

  // ─── HELPERS ────────────────────────────────────────────────────────────────

  private async loadDeveloper(developerId: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id: developerId } });
  }

  // ─── CREATE ─────────────────────────────────────────────────────────────────

  async create(developerId: string, dto: CreateProjectDto): Promise<Project> {
    const project = this.projectsRepo.create({
      ...dto,
      developerId,
      latitude: dto.latitude.toString(),
      longitude: dto.longitude.toString(),
      priceFrom: dto.priceFrom?.toString() ?? null,
      priceTo: dto.priceTo?.toString() ?? null,
      description: dto.description ?? null,
      district: dto.district ?? null,
      address: dto.address ?? null,
      deliveryDate: dto.deliveryDate ?? null,
    });

    const saved = await this.projectsRepo.save(project);
    const developer = await this.loadDeveloper(developerId);
    this.algolia.indexProject(saved, developer).catch(() => null);
    return saved;
  }

  // ─── FIND ALL ───────────────────────────────────────────────────────────────

  async findAll(query: QueryProjectsDto): Promise<{
    data: Project[];
    total: number;
    page: number;
    pages: number;
  }> {
    const { city, status, page = 1, limit = 20 } = query;

    const qb = this.projectsRepo
      .createQueryBuilder('p')
      .where('p.isActive = true')
      .orderBy('p.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (city) qb.andWhere('p.city = :city', { city });
    if (status) qb.andWhere('p.status = :status', { status });

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  // ─── MY PROJECTS ────────────────────────────────────────────────────────────

  async findMine(developerId: string, query: QueryProjectsDto): Promise<{
    data: Project[];
    total: number;
    page: number;
    pages: number;
  }> {
    const { page = 1, limit = 20 } = query;

    const [data, total] = await this.projectsRepo.findAndCount({
      where: { developerId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  // ─── FIND ONE ───────────────────────────────────────────────────────────────

  async findById(id: string): Promise<Project & { units: ProjectUnit[]; media: ProjectMedia[] }> {
    const project = await this.projectsRepo.findOne({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');

    const [units, media] = await Promise.all([
      this.unitsRepo.find({ where: { projectId: id }, order: { createdAt: 'ASC' } }),
      this.mediaRepo.find({ where: { projectId: id }, order: { order: 'ASC' } }),
    ]);

    return Object.assign(project, { units, media });
  }

  // ─── UPDATE ─────────────────────────────────────────────────────────────────

  async update(id: string, developerId: string, dto: UpdateProjectDto): Promise<Project> {
    const project = await this.projectsRepo.findOne({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.developerId !== developerId)
      throw new ForbiddenException('Not the project developer');

    const update: Partial<Project> = { ...dto } as Partial<Project>;
    if (dto.latitude !== undefined) update.latitude = dto.latitude.toString();
    if (dto.longitude !== undefined) update.longitude = dto.longitude.toString();
    if (dto.priceFrom !== undefined) update.priceFrom = dto.priceFrom?.toString() ?? null;
    if (dto.priceTo !== undefined) update.priceTo = dto.priceTo?.toString() ?? null;

    await this.projectsRepo.update(id, update);
    const updated = await this.projectsRepo.findOneOrFail({ where: { id } });

    const developer = await this.loadDeveloper(developerId);
    this.algolia.indexProject(updated, developer).catch(() => null);
    return updated;
  }

  // ─── TOGGLE ACTIVE ──────────────────────────────────────────────────────────

  async updateStatus(id: string, developerId: string, isActive: boolean): Promise<Project> {
    const project = await this.projectsRepo.findOne({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.developerId !== developerId)
      throw new ForbiddenException('Not the project developer');

    await this.projectsRepo.update(id, { isActive });
    const updated = await this.projectsRepo.findOneOrFail({ where: { id } });

    if (isActive) {
      const developer = await this.loadDeveloper(developerId);
      this.algolia.indexProject(updated, developer).catch(() => null);
    } else {
      this.algolia.deleteProject(id).catch(() => null);
    }

    return updated;
  }

  // ─── DELETE ─────────────────────────────────────────────────────────────────

  async remove(id: string, developerId: string): Promise<void> {
    const project = await this.projectsRepo.findOne({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.developerId !== developerId)
      throw new ForbiddenException('Not the project developer');

    await this.projectsRepo.softDelete(id);
    this.algolia.deleteProject(id).catch(() => null);
  }

  // ─── UNITS ───────────────────────────────────────────────────────────────────

  async addUnit(projectId: string, developerId: string, dto: CreateUnitDto): Promise<ProjectUnit> {
    const project = await this.projectsRepo.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.developerId !== developerId)
      throw new ForbiddenException('Not the project developer');

    const unit = this.unitsRepo.create({
      projectId,
      ...dto,
      area: dto.area.toString(),
      price: dto.price?.toString() ?? null,
      priceFrom: dto.priceFrom?.toString() ?? null,
      priceTo: dto.priceTo?.toString() ?? null,
    });
    const saved = await this.unitsRepo.save(unit);

    const newTotal = await this.unitsRepo.count({ where: { projectId } });
    await this.projectsRepo.update(projectId, { totalUnits: newTotal });
    this.algolia.updateProject(projectId, { totalUnits: newTotal }).catch(() => null);

    return saved;
  }

  async updateUnit(
    projectId: string,
    unitId: string,
    developerId: string,
    dto: UpdateUnitDto,
  ): Promise<ProjectUnit> {
    const project = await this.projectsRepo.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.developerId !== developerId)
      throw new ForbiddenException('Not the project developer');

    const unit = await this.unitsRepo.findOne({ where: { id: unitId, projectId } });
    if (!unit) throw new NotFoundException('Unit not found');

    const update: Partial<ProjectUnit> = { ...dto } as Partial<ProjectUnit>;
    if (dto.area !== undefined) update.area = dto.area.toString();
    if (dto.price !== undefined) update.price = dto.price?.toString() ?? null;
    if (dto.priceFrom !== undefined) update.priceFrom = dto.priceFrom?.toString() ?? null;
    if (dto.priceTo !== undefined) update.priceTo = dto.priceTo?.toString() ?? null;

    await this.unitsRepo.update(unitId, update);
    return this.unitsRepo.findOneOrFail({ where: { id: unitId } });
  }
}
