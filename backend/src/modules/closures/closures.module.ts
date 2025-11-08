import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClosuresService } from './closures.service';
import { ClosuresController } from './closures.controller';
import { DailyClosure } from './entities/daily-closure.entity';
import { TransactionsModule } from '../transactions/transactions.module';
import { AuditModule } from '../audit/audit.module';
import { ArchiveModule } from '../archive/archive.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DailyClosure]),
    TransactionsModule,
    AuditModule,
    ArchiveModule,
  ],
  controllers: [ClosuresController],
  providers: [ClosuresService],
  exports: [ClosuresService],
})
export class ClosuresModule {}
