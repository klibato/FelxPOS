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
import { Product } from './modules/products/entities/product.entity';
import { Category } from './modules/categories/entities/category.entity';

// Modules
import { ProductsModule } from './modules/products/products.module';
import { OperatorsModule } from './modules/operators/operators.module';
import { CashRegistersModule } from './modules/cash-registers/cash-registers.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { StatsModule } from './modules/stats/stats.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { ClosuresModule } from './modules/closures/closures.module';
import { AuditModule } from './modules/audit/audit.module';

// Services (standalone)
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
          Product,
          Category,
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

    // API Modules
    ProductsModule,
    OperatorsModule,
    CashRegistersModule,
    CategoriesModule,
    TenantsModule,
    StatsModule,
    TransactionsModule,
    ClosuresModule,
    AuditModule,
  ],
  providers: [
    // Standalone Services
    ArchiveService,
    ReceiptsService,
    FECService,
  ],
})
export class AppModule {}
