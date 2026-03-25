import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { algoliasearch, type SearchClient } from 'algoliasearch';
import { User } from '../users/entities/user.entity';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectsAlgoliaService {
  private readonly client: SearchClient;
  private readonly indexName: string;
  private readonly logger = new Logger(ProjectsAlgoliaService.name);

  constructor(private readonly config: ConfigService) {
    this.client = algoliasearch(
      config.get<string>('ALGOLIA_APP_ID')!,
      config.get<string>('ALGOLIA_API_KEY')!,
    );
    this.indexName = config.get<string>('ALGOLIA_PROJECTS_INDEX')!;
  }

  buildObject(project: Project, developer?: User | null) {
    return {
      objectID: project.id,
      title: project.title,
      description: project.description,
      status: project.status,
      city: project.city,
      district: project.district,
      _geoloc: {
        lat: Number(project.latitude),
        lng: Number(project.longitude),
      },
      priceFrom: project.priceFrom ? Number(project.priceFrom) : null,
      priceTo: project.priceTo ? Number(project.priceTo) : null,
      totalUnits: project.totalUnits,
      deliveryDate: project.deliveryDate,
      coverPhoto: project.coverPhoto,
      developerName: developer?.name ?? null,
      developerPhoto: developer?.profilePhoto ?? null,
      createdAt: Math.floor(new Date(project.createdAt).getTime() / 1000),
    };
  }

  async indexProject(project: Project, developer?: User | null): Promise<void> {
    try {
      await this.client.saveObject({
        indexName: this.indexName,
        body: this.buildObject(project, developer),
      });
    } catch (err) {
      this.logger.error(`Algolia indexProject failed for ${project.id}`, err);
    }
  }

  async updateProject(id: string, partial: Record<string, unknown>): Promise<void> {
    try {
      await this.client.partialUpdateObject({
        indexName: this.indexName,
        objectID: id,
        attributesToUpdate: partial,
        createIfNotExists: false,
      });
    } catch (err) {
      this.logger.error(`Algolia updateProject failed for ${id}`, err);
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      await this.client.deleteObject({ indexName: this.indexName, objectID: id });
    } catch (err) {
      this.logger.error(`Algolia deleteProject failed for ${id}`, err);
    }
  }
}
