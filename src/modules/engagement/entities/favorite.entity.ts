import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum FavoriteTargetType {
  LISTING = 'listing',
  PROJECT = 'project',
}

@Entity('favorites')
@Unique(['userId', 'targetType', 'targetId'])
@Index(['userId'])
@Index(['targetType'])
export class Favorite extends BaseEntity {
  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'enum', enum: FavoriteTargetType })
  targetType!: FavoriteTargetType;

  @Column({ type: 'uuid' })
  targetId!: string;
}
