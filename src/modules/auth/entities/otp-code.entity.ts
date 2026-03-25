import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('otp_codes')
@Index(['phone'])
@Index(['isUsed'])
@Index(['expiresAt'])
export class OtpCode extends BaseEntity {
  @Column({ type: 'varchar' })
  phone!: string;

  @Column({ type: 'varchar' })
  code!: string;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @Column({ type: 'boolean', default: false })
  isUsed!: boolean;
}
