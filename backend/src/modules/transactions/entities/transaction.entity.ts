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

@Entity('transactions')
@Index(['tenantId', 'transactionDate'])
@Index(['registerId', 'transactionDate'])
@Index(['tenantId', 'hashSequence'])
export class Transaction {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ type: 'uuid', unique: true })
  uuid: string;

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

  @Column({ type: 'uuid', name: 'operator_id', nullable: true })
  operatorId: string;

  @ManyToOne(() => Operator, { nullable: true })
  @JoinColumn({ name: 'operator_id' })
  operator: Operator;

  // Identification
  @Column({ type: 'bigint', name: 'transaction_number' })
  transactionNumber: string;

  @Column({ type: 'varchar', length: 50, unique: true, name: 'receipt_number' })
  receiptNumber: string;

  @Column({ type: 'timestamptz', name: 'transaction_date', default: () => 'NOW()' })
  transactionDate: Date;

  // Type et statut
  @Column({
    type: 'varchar',
    length: 20,
    name: 'transaction_type',
    default: 'sale',
  })
  transactionType: 'sale' | 'refund' | 'void' | 'correction';

  @Column({ type: 'varchar', length: 20, default: 'completed' })
  status: string;

  // Montants
  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'total_ht' })
  totalHt: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'total_vat' })
  totalVat: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'total_ttc' })
  totalTtc: number;

  // Détails (JSON)
  @Column({ type: 'jsonb', name: 'vat_details' })
  vatDetails: Record<string, any>;

  @Column({ type: 'jsonb' })
  items: Array<{
    sku?: string;
    name: string;
    quantity: number;
    price: number;
    vatRate: string;
  }>;

  // Paiement
  @Column({ type: 'varchar', length: 50, name: 'payment_method' })
  paymentMethod: 'cash' | 'card' | 'check' | 'transfer' | 'voucher' | 'mobile';

  @Column({ type: 'jsonb', nullable: true, name: 'payment_details' })
  paymentDetails: Record<string, any>;

  // Client (optionnel)
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'customer_email' })
  customerEmail: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'customer_phone' })
  customerPhone: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'customer_name' })
  customerName: string;

  // Hash chain NF525 (CRITIQUE)
  @Column({ type: 'varchar', length: 64, nullable: true, name: 'previous_hash' })
  previousHash: string;

  @Column({ type: 'varchar', length: 64, name: 'current_hash' })
  currentHash: string;

  @Column({ type: 'bigint', name: 'hash_sequence' })
  hashSequence: string;

  // Métadonnées
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'jsonb', nullable: true, default: {} })
  metadata: Record<string, any>;
}
