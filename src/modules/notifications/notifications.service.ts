import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Notification,
  NotificationReferenceType,
  NotificationType,
} from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  // Injected by the gateway after init to avoid circular dep
  private server: { to: (room: string) => { emit: (event: string, data: unknown) => void } } | null = null;

  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  setServer(server: NotificationsService['server']) {
    this.server = server;
  }

  // ─── CREATE & SEND ───────────────────────────────────────────────────────────

  async createAndSend(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    referenceType?: NotificationReferenceType,
    referenceId?: string,
  ): Promise<Notification> {
    const notification = this.repo.create({
      userId,
      type,
      title,
      body,
      referenceType: referenceType ?? null,
      referenceId: referenceId ?? null,
    });

    const saved = await this.repo.save(notification);
    this.server?.to(userId).emit('new_notification', saved);
    return saved;
  }

  // ─── MARK AS READ ────────────────────────────────────────────────────────────

  async markAsRead(userId: string, notificationId: string): Promise<Notification> {
    const notification = await this.repo.findOne({ where: { id: notificationId } });
    if (!notification) throw new NotFoundException('Notification not found');
    if (notification.userId !== userId) throw new ForbiddenException('Not your notification');

    notification.isRead = true;
    notification.readAt = new Date();
    return this.repo.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.repo.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }

  // ─── QUERY ───────────────────────────────────────────────────────────────────

  async getUserNotifications(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: Notification[]; total: number; page: number }> {
    const [data, total] = await this.repo.findAndCount({
      where: { userId },
      order: { isRead: 'ASC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page };
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.repo.count({ where: { userId, isRead: false } });
    return { count };
  }
}
