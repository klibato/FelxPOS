import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

// Entities
import { Tenant } from './modules/tenants/entities/tenant.entity';
import { CashRegister } from './modules/cash-registers/entities/cash-register.entity';
import { Operator } from './modules/operators/entities/operator.entity';
import { Transaction } from './modules/transactions/entities/transaction.entity';
import { DailyClosure } from './modules/closures/entities/daily-closure.entity';
import { AuditLog } from './modules/audit/entities/audit-log.entity';

// Services
import { TransactionsService } from './modules/transactions/transactions.service';
import { ClosuresService } from './modules/closures/closures.service';
import { AuditService } from './modules/audit/audit.service';
import { ArchiveService } from './modules/archive/archive.service';
import { ReceiptsService } from './modules/receipts/receipts.service';
import { FECService } from './modules/exports/fec.service';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Scheduler pour clôtures automatiques
    ScheduleModule.forRoot(),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [
          Tenant,
          CashRegister,
          Operator,
          Transaction,
          DailyClosure,
          AuditLog,
        ],
        synchronize: configService.get('DB_SYNCHRONIZE') === 'true',
        logging: configService.get('DB_LOGGING') === 'true',
        // Optimisations pour NF525
        extra: {
          max: 20, // Pool de connexions
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        },
      }),
      inject: [ConfigService],
    }),

    // Feature modules
    TypeOrmModule.forFeature([
      Tenant,
      CashRegister,
      Operator,
      Transaction,
      DailyClosure,
      AuditLog,
    ]),
  ],
  providers: [
    // Services
    TransactionsService,
    ClosuresService,
    AuditService,
    ArchiveService,
    ReceiptsService,
    FECService,
  ],
})
export class AppModule {}
