import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Wallet } from './wallet.entity';

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export enum TransactionReferenceType {
  TOP_UP = 'top_up',
  PROMOTION = 'promotion',
  SUBSCRIPTION = 'subscription',
  BOOKING = 'booking',
}

@Entity('transactions')
@Index(['walletId'])
@Index(['type'])
@Index(['referenceType'])
@Index(['createdAt'])
export class Transaction extends BaseEntity {
  @Column({ type: 'uuid' })
  walletId!: string;

  @ManyToOne(() => Wallet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'walletId' })
  wallet!: Wallet;

  @Column({ type: 'enum', enum: TransactionType })
  type!: TransactionType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  balanceBefore!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  balanceAfter!: string;

  @Column({ type: 'varchar' })
  description!: string;

  @Column({ type: 'enum', enum: TransactionReferenceType })
  referenceType!: TransactionReferenceType;

  @Column({ type: 'uuid', nullable: true })
  referenceId!: string | null;
}
