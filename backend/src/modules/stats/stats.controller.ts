import { Controller, Get, Query, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../transactions/entities/transaction.entity';

@Controller('stats')
export class StatsController {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  @Get('daily')
  async getDailyStats(@Request() req, @Query('date') date?: string) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    const targetDate = date ? new Date(date) : new Date();

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const transactions = await this.transactionsRepository
      .createQueryBuilder('t')
      .where('t.tenant_id = :tenantId', { tenantId })
      .andWhere('t.transaction_date >= :startOfDay', { startOfDay })
      .andWhere('t.transaction_date <= :endOfDay', { endOfDay })
      .getMany();

    const totalTransactions = transactions.length;
    const totalSales = transactions.filter(t => (t as any).transactionType === 'sale').length;
    const totalRefunds = transactions.filter(t => (t as any).transactionType === 'refund').length;
    const totalRevenue = transactions
      .filter(t => (t as any).transactionType === 'sale')
      .reduce((sum, t) => sum + Number(t.totalTtc), 0);
    const totalRefunded = transactions
      .filter(t => (t as any).transactionType === 'refund')
      .reduce((sum, t) => sum + Number(t.totalTtc), 0);

    // Payment methods breakdown
    const paymentMethods: Record<string, number> = {};
    transactions.forEach(t => {
      const method = t.paymentMethod || 'unknown';
      paymentMethods[method] = (paymentMethods[method] || 0) + 1;
    });

    // VAT breakdown
    const vatBreakdown: Record<string, any> = {};
    transactions.forEach(t => {
      if (t.vatDetails) {
        Object.entries(t.vatDetails).forEach(([rate, details]: [string, any]) => {
          if (!vatBreakdown[rate]) {
            vatBreakdown[rate] = { ht: 0, vat: 0, ttc: 0 };
          }
          vatBreakdown[rate].ht += Number(details.ht || 0);
          vatBreakdown[rate].vat += Number(details.vat || 0);
          vatBreakdown[rate].ttc += Number(details.ttc || 0);
        });
      }
    });

    return {
      totalTransactions,
      totalSales,
      totalRefunds,
      totalRevenue,
      totalRefunded,
      paymentMethods,
      vatBreakdown,
    };
  }
}
