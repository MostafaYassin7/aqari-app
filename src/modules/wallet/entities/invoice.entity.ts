import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Transaction } from './transaction.entity';

export enum InvoiceReferenceType {
  TOP_UP = 'top_up',
  PROMOTION = 'promotion',
  SUBSCRIPTION = 'subscription',
  BOOKING = 'booking',
}

export enum InvoiceStatus {
  PAID = 'paid',
  REFUNDED = 'refunded',
  PENDING = 'pending',
}

@Entity('invoices')
export class Invoice extends BaseEntity {
  @Column({ type: 'uuid', unique: true })
  transactionId!: string;

  @OneToOne(() => Transaction, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transactionId' })
  transaction!: Transaction;

  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'enum', enum: InvoiceReferenceType })
  referenceType!: InvoiceReferenceType;

  @Column({ type: 'uuid' })
  referenceId!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: string;

  @Column({ type: 'varchar', default: 'SAR' })
  currency!: string;

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.PAID })
  status!: InvoiceStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  issuedAt!: Date;
}
