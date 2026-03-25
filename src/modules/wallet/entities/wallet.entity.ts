import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('wallets')
export class Wallet extends BaseEntity {
  @Column({ type: 'uuid', unique: true })
  userId!: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  balance!: string;

  @Column({ type: 'varchar', default: 'SAR' })
  currency!: string;
}
