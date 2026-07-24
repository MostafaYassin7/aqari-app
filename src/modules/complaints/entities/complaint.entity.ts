import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum ComplaintStatus {
  RECEIVED = 'received',
  IN_REVIEW = 'in_review',
  RESOLVED = 'resolved',
}

@Entity('complaints')
@Index(['number'], { unique: true })
@Index(['status'])
@Index(['createdAt'])
export class Complaint {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  number!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar' })
  phone!: string;

  @Column({ type: 'varchar', nullable: true })
  email!: string | null;

  @Column({ type: 'varchar' })
  subject!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({
    type: 'varchar',
    default: ComplaintStatus.RECEIVED,
  })
  status!: ComplaintStatus;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;
}
