import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { ProjectMedia } from './entities/project-media.entity';
import { ProjectUnit } from './entities/project-unit.entity';
import { Project } from './entities/project.entity';
import { ProjectsAlgoliaService } from './projects-algolia.service';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectUnit, ProjectMedia, User])],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectsAlgoliaService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
