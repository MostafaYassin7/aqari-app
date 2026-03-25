import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Project } from './project.entity';

export enum UnitType {
  STUDIO = 'studio',
  BR1 = '1br',
  BR2 = '2br',
  BR3 = '3br',
  BR4 = '4br',
  VILLA = 'villa',
  COMMERCIAL = 'commercial',
}

export enum UnitAvailability {
  AVAILABLE = 'available',
  SOLD = 'sold',
  RESERVED = 'reserved',
}

@Entity('project_units')
export class ProjectUnit extends BaseEntity {
  @Column({ type: 'uuid' })
  projectId!: string;

  @ManyToOne(() => Project, (p) => p.units, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project!: Project;

  @Column({ type: 'enum', enum: UnitType })
  unitType!: UnitType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  area!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  price!: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  priceFrom!: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  priceTo!: string | null;

  @Column({ type: 'integer', nullable: true })
  floor!: number | null;

  @Column({ type: 'enum', enum: UnitAvailability, default: UnitAvailability.AVAILABLE })
  availability!: UnitAvailability;
}
