import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { CashRegistersService } from './cash-registers.service';
import { CreateCashRegisterDto } from './dto/create-cash-register.dto';
import { UpdateCashRegisterDto } from './dto/update-cash-register.dto';

@Controller('registers')
export class CashRegistersController {
  constructor(private readonly cashRegistersService: CashRegistersService) {}

  @Post()
  create(@Request() req, @Body() createCashRegisterDto: CreateCashRegisterDto) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    return this.cashRegistersService.create(tenantId, createCashRegisterDto);
  }

  @Get()
  findAll(@Request() req) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    return this.cashRegistersService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    return this.cashRegistersService.findOne(tenantId, id);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateCashRegisterDto: UpdateCashRegisterDto) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    return this.cashRegistersService.update(tenantId, id, updateCashRegisterDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    return this.cashRegistersService.remove(tenantId, id);
  }
}
