import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Project } from './project.entity';

export enum ProjectMediaType {
  PHOTO = 'photo',
  VIDEO = 'video',
}

@Entity('project_media')
export class ProjectMedia extends BaseEntity {
  @Column({ type: 'uuid' })
  projectId!: string;

  @ManyToOne(() => Project, (p) => p.media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project!: Project;

  @Column({ type: 'varchar' })
  url!: string;

  @Column({ type: 'enum', enum: ProjectMediaType })
  type!: ProjectMediaType;

  @Column({ type: 'boolean', default: false })
  isCover!: boolean;

  @Column({ type: 'integer', default: 0 })
  order!: number;
}
