import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Listing } from '../../listings/entities/listing.entity';
import { User } from '../../users/entities/user.entity';
import { Message } from './message.entity';

@Entity('chats')
@Unique(['participantA', 'participantB', 'listingId'])
@Index(['participantA'])
@Index(['participantB'])
@Index(['lastMessageAt'])
export class Chat extends BaseEntity {
  @Column({ type: 'uuid' })
  participantA!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'participantA' })
  userA!: User;

  @Column({ type: 'uuid' })
  participantB!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'participantB' })
  userB!: User;

  @Column({ type: 'uuid', nullable: true })
  listingId!: string | null;

  @ManyToOne(() => Listing, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'listingId' })
  listing!: Listing | null;

  @Column({ type: 'varchar', nullable: true })
  lastMessage!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  lastMessageAt!: Date | null;

  @Column({ type: 'boolean', default: false })
  isDeletedByA!: boolean;

  @Column({ type: 'boolean', default: false })
  isDeletedByB!: boolean;

  @OneToMany(() => Message, (msg) => msg.chat, { lazy: true })
  messages!: Promise<Message[]>;
}
