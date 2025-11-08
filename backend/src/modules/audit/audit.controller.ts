import { Controller, Get, Request } from '@nestjs/common';
import { AuditService } from './audit.service';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('anomalies')
  getAnomalies(@Request() req) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    // Return audit logs filtered by anomaly-related event types
    return this.auditService.findByEventType(tenantId, 'HASH_VERIFICATION_FAILED');
  }

  @Get()
  findAll(@Request() req) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    return this.auditService.findAll(tenantId);
  }
}
