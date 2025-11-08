import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import * as crypto from 'crypto';

export interface LogAuditDto {
  tenantId: string;
  userId?: string;
  eventType: string;
  resourceType?: string;
  resourceId?: string;
  action?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepo: Repository<AuditLog>,
  ) {}

  /**
   * Logger un événement dans l'audit
   */
  async log(data: LogAuditDto): Promise<AuditLog> {
    // Récupérer le hash précédent pour chaînage
    const previousLog = await this.auditLogRepo.findOne({
      where: { tenantId: data.tenantId },
      order: { id: 'DESC' },
    });

    const previousHash = previousLog?.hash || 'GENESIS';

    // Calculer le hash de cet événement
    const dataToHash = JSON.stringify({
      tenantId: data.tenantId,
      eventType: data.eventType,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      timestamp: new Date().toISOString(),
      previousHash,
    });

    const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');

    const auditLog = this.auditLogRepo.create({
      ...data,
      hash,
      previousHash,
    });

    return this.auditLogRepo.save(auditLog);
  }

  /**
   * Logger une erreur
   */
  async logError(data: Omit<LogAuditDto, 'eventType'> & { error: string; stack?: string }) {
    return this.log({
      ...data,
      eventType: 'SYSTEM_ERROR',
      metadata: {
        ...data.metadata,
        error: data.error,
        stack: data.stack,
      },
    });
  }

  /**
   * Récupérer les logs d'audit
   */
  async findAll(tenantId: string, limit = 100, offset = 0): Promise<AuditLog[]> {
    return this.auditLogRepo.find({
      where: { tenantId },
      order: { eventDate: 'DESC' },
      take: limit,
      skip: offset,
      relations: ['user'],
    });
  }

  /**
   * Récupérer les logs par type d'événement
   */
  async findByEventType(tenantId: string, eventType: string, limit = 100): Promise<AuditLog[]> {
    return this.auditLogRepo.find({
      where: { tenantId, eventType },
      order: { eventDate: 'DESC' },
      take: limit,
    });
  }

  /**
   * Récupérer les logs pour une ressource spécifique
   */
  async findByResource(
    tenantId: string,
    resourceType: string,
    resourceId: string,
  ): Promise<AuditLog[]> {
    return this.auditLogRepo.find({
      where: { tenantId, resourceType, resourceId },
      order: { eventDate: 'DESC' },
      relations: ['user'],
    });
  }
}
