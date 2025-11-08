import { Controller, Get, Post, Body, Param, Query, Request } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Request() req, @Body() createTransactionDto: CreateTransactionDto) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    return this.transactionsService.createTransaction(tenantId, createTransactionDto);
  }

  @Get()
  findAll(@Request() req, @Query('date') date?: string, @Query('registerId') registerId?: string) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    return this.transactionsService.findAll(tenantId, { date, registerId });
  }

  @Get(':uuid')
  findOne(@Request() req, @Param('uuid') uuid: string) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    return this.transactionsService.findOne(tenantId, uuid);
  }

  @Get('verify-hash-chain')
  verifyHashChain(@Request() req) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    return this.transactionsService.verifyHashChain(tenantId);
  }
}
