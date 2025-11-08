import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { CashRegister } from '../../cash-registers/entities/cash-register.entity';
import { Operator } from '../../operators/entities/operator.entity';

@Entity('daily_closures')
@Index(['tenantId', 'closureDate'])
@Index(['registerId', 'closureDate'])
export class DailyClosure {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relations
  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ type: 'uuid', name: 'register_id' })
  registerId: string;

  @ManyToOne(() => CashRegister)
  @JoinColumn({ name: 'register_id' })
  register: CashRegister;

  @Column({ type: 'uuid', nullable: true, name: 'operator_id' })
  operatorId: string;

  @ManyToOne(() => Operator, { nullable: true })
  @JoinColumn({ name: 'operator_id' })
  operator: Operator;

  // Date de clôture
  @Column({ type: 'date', name: 'closure_date' })
  closureDate: Date;

  @Column({ type: 'timestamptz', name: 'closure_time', default: () => 'NOW()' })
  closureTime: Date;

  // Statistiques
  @Column({ type: 'integer', default: 0, name: 'total_transactions' })
  totalTransactions: number;

  @Column({ type: 'integer', default: 0, name: 'total_sales' })
  totalSales: number;

  @Column({ type: 'integer', default: 0, name: 'total_refunds' })
  totalRefunds: number;

  @Column({ type: 'integer', default: 0, name: 'total_voids' })
  totalVoids: number;

  // Totaux financiers
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    name: 'total_ht',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  totalHt: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    name: 'total_vat',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  totalVat: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    name: 'total_ttc',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  totalTtc: number;

  // Répartitions
  @Column({ type: 'jsonb', name: 'vat_breakdown' })
  vatBreakdown: Record<string, any>;

  @Column({ type: 'jsonb', name: 'payment_breakdown' })
  paymentBreakdown: Record<string, any>;

  // Hash de contrôle NF525
  @Column({ type: 'varchar', length: 64, nullable: true, name: 'first_transaction_hash' })
  firstTransactionHash: string;

  @Column({ type: 'varchar', length: 64, nullable: true, name: 'last_transaction_hash' })
  lastTransactionHash: string;

  @Column({ type: 'varchar', length: 64, name: 'closure_hash' })
  closureHash: string;

  // Archivage
  @Column({ type: 'text', nullable: true, name: 'archive_url' })
  archiveUrl: string;

  @Column({ type: 'timestamptz', nullable: true, name: 'archived_at' })
  archivedAt: Date;

  @Column({ type: 'varchar', length: 128, nullable: true, name: 'archive_signature' })
  archiveSignature: string;

  // Vérification
  @Column({ type: 'boolean', default: false, name: 'is_verified' })
  isVerified: boolean;

  @Column({ type: 'timestamptz', nullable: true, name: 'verification_date' })
  verificationDate: Date;

  // Métadonnées
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'jsonb', nullable: true, default: {} })
  metadata: Record<string, any>;
}
