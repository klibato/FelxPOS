import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { CashRegister } from '../../cash-registers/entities/cash-register.entity';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Informations entreprise
  @Column({ type: 'varchar', length: 14, unique: true })
  siret: string;

  @Column({ type: 'varchar', length: 255, name: 'company_name' })
  companyName: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'legal_form' })
  legalForm: string;

  @Column({ type: 'varchar', length: 5, name: 'naf_code' })
  nafCode: string;

  @Column({ type: 'varchar', length: 13, nullable: true, name: 'vat_number' })
  vatNumber: string;

  // Adresse
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'address_line1' })
  addressLine1: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'address_line2' })
  addressLine2: string;

  @Column({ type: 'varchar', length: 10, nullable: true, name: 'postal_code' })
  postalCode: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 2, default: 'FR' })
  country: string;

  // Contact
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  // Conformité NF525
  @Column({ type: 'boolean', default: false, name: 'nf525_compliant' })
  nf525Compliant: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'certification_number' })
  certificationNumber: string;

  @Column({ type: 'date', nullable: true, name: 'certification_date' })
  certificationDate: Date;

  @Column({ type: 'date', nullable: true, name: 'certification_expiry' })
  certificationExpiry: Date;

  // Statut
  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'varchar', length: 50, default: 'starter', name: 'subscription_plan' })
  subscriptionPlan: string;

  // Métadonnées
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true, default: {} })
  metadata: Record<string, any>;

  // Relations
  @OneToMany(() => Transaction, (transaction) => transaction.tenant)
  transactions: Transaction[];

  @OneToMany(() => CashRegister, (register) => register.tenant)
  cashRegisters: CashRegister[];
}
