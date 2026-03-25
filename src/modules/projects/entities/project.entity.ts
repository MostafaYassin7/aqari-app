import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { ProjectMedia } from './project-media.entity';
import { ProjectUnit } from './project-unit.entity';

export enum ProjectStatus {
  READY = 'ready',
  OFF_PLAN = 'off_plan',
}

@Entity('projects')
@Index(['city'])
@Index(['status'])
@Index(['developerId'])
@Index(['isActive'])
export class Project extends BaseEntity {
  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'uuid' })
  developerId!: string;

  @ManyToOne(() => User, { lazy: true })
  @JoinColumn({ name: 'developerId' })
  developer!: Promise<User>;

  @Column({ type: 'varchar', nullable: true })
  coverPhoto!: string | null;

  @Column({ type: 'varchar' })
  city!: string;

  @Column({ type: 'varchar', nullable: true })
  district!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude!: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude!: string;

  @Column({ type: 'varchar', nullable: true })
  address!: string | null;

  @Column({ type: 'enum', enum: ProjectStatus })
  status!: ProjectStatus;

  @Column({ type: 'date', nullable: true })
  deliveryDate!: string | null;

  @Column({ type: 'integer', default: 0 })
  totalUnits!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  priceFrom!: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  priceTo!: string | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany(() => ProjectUnit, (unit) => unit.project, { lazy: true })
  units!: Promise<ProjectUnit[]>;

  @OneToMany(() => ProjectMedia, (media) => media.project, { lazy: true })
  media!: Promise<ProjectMedia[]>;
}
