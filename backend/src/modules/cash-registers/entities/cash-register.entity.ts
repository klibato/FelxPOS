import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

@Entity('cash_registers')
export class CashRegister {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  // Identification
  @Column({ type: 'varchar', length: 50, name: 'register_code' })
  registerCode: string;

  @Column({ type: 'varchar', length: 100, unique: true, name: 'serial_number' })
  serialNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location: string;

  // Activation
  @Column({ type: 'timestamptz', name: 'activation_date', default: () => 'NOW()' })
  activationDate: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'deactivation_date' })
  deactivationDate: Date;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  // Configuration
  @Column({ type: 'boolean', default: true, name: 'auto_closure_enabled' })
  autoClosureEnabled: boolean;

  @Column({ type: 'time', default: '23:59:00', name: 'auto_closure_time' })
  autoClosureTime: string;

  @Column({ type: 'text', nullable: true, name: 'receipt_header' })
  receiptHeader: string;

  @Column({ type: 'text', nullable: true, name: 'receipt_footer' })
  receiptFooter: string;

  // Métadonnées
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true, default: {} })
  metadata: Record<string, any>;

  // Relations
  @OneToMany(() => Transaction, (transaction) => transaction.register)
  transactions: Transaction[];
}
