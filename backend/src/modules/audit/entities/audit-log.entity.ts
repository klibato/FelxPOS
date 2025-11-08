import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Operator } from '../../operators/entities/operator.entity';

@Entity('audit_logs')
@Index(['tenantId', 'eventDate'])
@Index(['eventType', 'eventDate'])
export class AuditLog {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  // Relations
  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ type: 'uuid', nullable: true, name: 'user_id' })
  userId: string;

  @ManyToOne(() => Operator, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: Operator;

  // Événement
  @Column({ type: 'varchar', length: 100, name: 'event_type' })
  eventType: string;

  @Column({ type: 'timestamptz', name: 'event_date', default: () => 'NOW()' })
  eventDate: Date;

  // Contexte
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'resource_type' })
  resourceType: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'resource_id' })
  resourceId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  action: string;

  // Données
  @Column({ type: 'jsonb', nullable: true, name: 'old_values' })
  oldValues: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true, name: 'new_values' })
  newValues: Record<string, any>;

  // Traçabilité réseau
  @Column({ type: 'inet', nullable: true, name: 'ip_address' })
  ipAddress: string;

  @Column({ type: 'text', nullable: true, name: 'user_agent' })
  userAgent: string;

  // Hash chain
  @Column({ type: 'varchar', length: 64 })
  hash: string;

  @Column({ type: 'varchar', length: 64, nullable: true, name: 'previous_hash' })
  previousHash: string;

  // Métadonnées
  @Column({ type: 'jsonb', nullable: true, default: {} })
  metadata: Record<string, any>;
}
