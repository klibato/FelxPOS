import { Controller, Get, Patch, Body, Request } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('current')
  getCurrent(@Request() req) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    return this.tenantsService.findOne(tenantId);
  }

  @Patch('current')
  updateCurrent(@Request() req, @Body() updateTenantDto: UpdateTenantDto) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    return this.tenantsService.update(tenantId, updateTenantDto);
  }
}
