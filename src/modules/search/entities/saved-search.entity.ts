import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('saved_searches')
@Index(['userId'])
@Index(['alertEnabled'])
export class SavedSearch extends BaseEntity {
  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'varchar', nullable: true })
  name!: string | null;

  @Column({ type: 'jsonb' })
  filters!: Record<string, unknown>;

  @Column({ type: 'boolean', default: true })
  alertEnabled!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastRunAt!: Date | null;
}
