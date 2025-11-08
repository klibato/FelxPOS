import { Controller, Get, Post, Body, Param, Query, Request } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Request() req, @Body() createTransactionDto: CreateTransactionDto) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    const registerId = createTransactionDto.registerId || req.user?.registerId;
    const operatorId = createTransactionDto.operatorId || req.user?.id;
    return this.transactionsService.createTransaction(createTransactionDto, tenantId, registerId, operatorId);
  }

  @Get()
  findAll(@Request() req, @Query('date') date?: string, @Query('registerId') registerId?: string) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    if (date) {
      const targetDate = new Date(date);
      return this.transactionsService.findToday(tenantId, registerId);
    }
    // Default to today's transactions
    return this.transactionsService.findToday(tenantId, registerId);
  }

  @Get(':uuid')
  findOne(@Request() req, @Param('uuid') uuid: string) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    return this.transactionsService.findOne(uuid, tenantId);
  }

  @Get('verify-hash-chain')
  verifyHashChain(@Request() req) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    return this.transactionsService.verifyHashChain(tenantId);
  }
}
