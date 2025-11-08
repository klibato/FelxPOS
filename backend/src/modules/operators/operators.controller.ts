import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { OperatorsService } from './operators.service';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { UpdateOperatorDto } from './dto/update-operator.dto';

@Controller('operators')
export class OperatorsController {
  constructor(private readonly operatorsService: OperatorsService) {}

  @Post()
  create(@Request() req, @Body() createOperatorDto: CreateOperatorDto) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    return this.operatorsService.create(tenantId, createOperatorDto);
  }

  @Get()
  findAll(@Request() req) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    return this.operatorsService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    return this.operatorsService.findOne(tenantId, id);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateOperatorDto: UpdateOperatorDto) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    return this.operatorsService.update(tenantId, id, updateOperatorDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    return this.operatorsService.remove(tenantId, id);
  }
}
