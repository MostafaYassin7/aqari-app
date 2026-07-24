import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { Complaint, ComplaintStatus } from './entities/complaint.entity';

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectRepository(Complaint)
    private readonly complaintsRepository: Repository<Complaint>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(
    dto: CreateComplaintDto,
  ): Promise<{ number: string; createdAt: Date }> {
    return this.dataSource.transaction(async (manager) => {
      const year = new Date().getFullYear();

      // Serialize number generation so simultaneous submissions cannot receive
      // the same reference number. The lock is released with the transaction.
      await manager.query(
        `SELECT pg_advisory_xact_lock(hashtext($1))`,
        [`complaints-${year}`],
      );

      const latest = await manager
        .getRepository(Complaint)
        .createQueryBuilder('complaint')
        .select('complaint.number', 'number')
        .where('complaint.number LIKE :prefix', { prefix: `AQ-${year}-%` })
        .orderBy('complaint.number', 'DESC')
        .getRawOne<{ number: string }>();

      const nextSequence = latest
        ? Number.parseInt(latest.number.split('-').at(-1) ?? '0', 10) + 1
        : 1;
      const number = `AQ-${year}-${String(nextSequence).padStart(4, '0')}`;

      const complaint = manager.create(Complaint, {
        ...dto,
        email: dto.email || null,
        number,
        status: ComplaintStatus.RECEIVED,
      });
      const saved = await manager.save(complaint);

      return { number: saved.number, createdAt: saved.createdAt };
    });
  }

  async findAll(page: number, limit: number, status?: ComplaintStatus) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const [data, total] = await this.complaintsRepository.findAndCount({
      where: status ? { status } : {},
      order: { createdAt: 'DESC' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });

    return {
      data,
      total,
      page: safePage,
      pages: Math.ceil(total / safeLimit),
    };
  }

  async updateStatus(id: string, status: ComplaintStatus): Promise<Complaint> {
    const complaint = await this.complaintsRepository.findOne({ where: { id } });
    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }

    complaint.status = status;
    return this.complaintsRepository.save(complaint);
  }
}
