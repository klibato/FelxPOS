import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { ClosuresService } from './closures.service';
import { CreateClosureDto } from './dto/create-closure.dto';

@Controller('closures')
export class ClosuresController {
  constructor(private readonly closuresService: ClosuresService) {}

  @Post()
  create(@Request() req, @Body() createClosureDto: CreateClosureDto) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    return this.closuresService.createDailyClosure(
      tenantId,
      createClosureDto.registerId,
      new Date(createClosureDto.date),
    );
  }

  @Get()
  findAll(@Request() req) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    return this.closuresService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    return this.closuresService.findOne(tenantId, id);
  }
}
