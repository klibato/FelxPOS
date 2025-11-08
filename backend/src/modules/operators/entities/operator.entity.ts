import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Entity('operators')
export class Operator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  // Informations personnelles
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'first_name' })
  firstName: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'last_name' })
  lastName: string;

  // Authentification
  @Column({ type: 'uuid', unique: true, nullable: true, name: 'supabase_user_id' })
  supabaseUserId: string;

  // Rôle et permissions
  @Column({ type: 'varchar', length: 50, default: 'cashier' })
  role: 'admin' | 'manager' | 'cashier' | 'accountant';

  @Column({ type: 'jsonb', nullable: true, default: [] })
  permissions: string[];

  // Statut
  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  // Métadonnées
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'last_login' })
  lastLogin: Date;
}
