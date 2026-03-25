import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';
import { Client } from './entities/client.entity';
import { Deal } from './entities/deal.entity';
import { Reminder } from './entities/reminder.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Client, Reminder, Deal])],
  controllers: [CrmController],
  providers: [CrmService],
  exports: [CrmService],
})
export class CrmModule {}
