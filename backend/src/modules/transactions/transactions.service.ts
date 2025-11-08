import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { AuditService } from '../audit/audit.service';
import * as crypto from 'crypto';

@Injectable()
export class TransactionsService {
  private readonly VAT_RATES = {
    standard: 20.0,
    intermediate: 10.0,
    reduced: 5.5,
    super_reduced: 5.5,
    minimum: 2.1,
  };

  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    private dataSource: DataSource,
    private auditService: AuditService,
  ) {}

  /**
   * Créer une nouvelle transaction avec vérification NF525
   */
  async createTransaction(
    createDto: CreateTransactionDto,
    tenantId: string,
    registerId: string,
    operatorId?: string,
  ): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    // Isolation SERIALIZABLE pour garantir la cohérence de la chaîne de hash
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      // Valider les articles
      if (!createDto.items || createDto.items.length === 0) {
        throw new BadRequestException('Au moins un article est requis');
      }

      // Calculer les montants
      const { totalHt, totalVat, totalTtc, vatDetails } = this.calculateAmounts(createDto.items);

      // Créer la transaction (les triggers DB calculeront automatiquement le hash)
      const transaction = this.transactionRepo.create({
        tenantId,
        registerId,
        operatorId,
        transactionType: 'sale',
        status: 'completed',
        totalHt,
        totalVat,
        totalTtc,
        vatDetails,
        items: createDto.items,
        paymentMethod: createDto.paymentMethod,
        paymentDetails: createDto.paymentDetails || {},
        customerEmail: createDto.customerEmail,
        customerPhone: createDto.customerPhone,
        customerName: createDto.customerName,
        metadata: createDto.metadata || {},
        uuid: crypto.randomUUID(),
      });

      // Sauvegarder
      const saved = await queryRunner.manager.save(transaction);

      // Logger dans l'audit
      await this.auditService.log({
        tenantId,
        userId: operatorId,
        eventType: 'TRANSACTION_CREATED',
        resourceType: 'transaction',
        resourceId: saved.uuid,
        newValues: {
          id: saved.id,
          receiptNumber: saved.receiptNumber,
          totalTtc: saved.totalTtc,
          paymentMethod: saved.paymentMethod,
        },
      });

      await queryRunner.commitTransaction();

      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(`Échec de la transaction: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Calculer les montants HT, TVA et TTC
   */
  private calculateAmounts(items: any[]): {
    totalHt: number;
    totalVat: number;
    totalTtc: number;
    vatDetails: Record<string, any>;
  } {
    const vatDetails: Record<string, any> = {};
    let totalHt = 0;
    let totalVat = 0;
    let totalTtc = 0;

    items.forEach((item) => {
      const rate = this.VAT_RATES[item.vatRate] || 20.0;
      const itemTtc = item.price * item.quantity;
      const itemHt = itemTtc / (1 + rate / 100);
      const itemVat = itemTtc - itemHt;

      // Ajouter aux totaux
      totalTtc += itemTtc;
      totalHt += itemHt;
      totalVat += itemVat;

      // Grouper par taux de TVA
      const rateKey = rate.toString();
      if (!vatDetails[rateKey]) {
        vatDetails[rateKey] = { ht: 0, vat: 0, ttc: 0 };
      }

      vatDetails[rateKey].ht += itemHt;
      vatDetails[rateKey].vat += itemVat;
      vatDetails[rateKey].ttc += itemTtc;
    });

    // Arrondir à 2 décimales
    totalHt = Math.round(totalHt * 100) / 100;
    totalVat = Math.round(totalVat * 100) / 100;
    totalTtc = Math.round(totalTtc * 100) / 100;

    // Arrondir les détails TVA
    Object.keys(vatDetails).forEach((rate) => {
      vatDetails[rate].ht = Math.round(vatDetails[rate].ht * 100) / 100;
      vatDetails[rate].vat = Math.round(vatDetails[rate].vat * 100) / 100;
      vatDetails[rate].ttc = Math.round(vatDetails[rate].ttc * 100) / 100;
    });

    return { totalHt, totalVat, totalTtc, vatDetails };
  }

  /**
   * Récupérer une transaction par UUID
   */
  async findOne(uuid: string, tenantId: string): Promise<Transaction> {
    const transaction = await this.transactionRepo.findOne({
      where: { uuid, tenantId },
      relations: ['tenant', 'register', 'operator'],
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction ${uuid} non trouvée`);
    }

    return transaction;
  }

  /**
   * Récupérer les transactions d'une période
   */
  async findByPeriod(
    tenantId: string,
    startDate: Date,
    endDate: Date,
    registerId?: string,
  ): Promise<Transaction[]> {
    const where: any = {
      tenantId,
      transactionDate: Between(startDate, endDate),
    };

    if (registerId) {
      where.registerId = registerId;
    }

    return this.transactionRepo.find({
      where,
      order: { transactionDate: 'DESC' },
      relations: ['register', 'operator'],
    });
  }

  /**
   * Récupérer les transactions du jour
   */
  async findToday(tenantId: string, registerId?: string): Promise<Transaction[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return this.findByPeriod(tenantId, startOfDay, endOfDay, registerId);
  }

  /**
   * Vérifier l'intégrité de la chaîne de hash (NF525)
   */
  async verifyHashChain(
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    isValid: boolean;
    totalChecked: number;
    firstErrorId?: string;
    firstErrorHash?: string;
  }> {
    const where: any = { tenantId };

    if (startDate) {
      where.transactionDate = MoreThanOrEqual(startDate);
    }
    if (endDate) {
      where.transactionDate = LessThanOrEqual(endDate);
    }

    const transactions = await this.transactionRepo.find({
      where,
      order: { hashSequence: 'ASC' },
    });

    let previousHash = 'GENESIS';
    let totalChecked = 0;

    for (const tx of transactions) {
      totalChecked++;

      // Vérifier que previous_hash correspond
      if (tx.previousHash !== previousHash) {
        await this.auditService.log({
          tenantId,
          eventType: 'HASH_VERIFICATION_FAILED',
          resourceType: 'transaction',
          resourceId: tx.uuid,
          metadata: {
            expected: previousHash,
            actual: tx.previousHash,
            reason: 'previous_hash_mismatch',
          },
        });

        return {
          isValid: false,
          totalChecked,
          firstErrorId: tx.id,
          firstErrorHash: tx.currentHash,
        };
      }

      // Recalculer le hash pour vérification
      const dataToHash = `${previousHash}|${tx.uuid}|${tx.transactionNumber}|${new Date(tx.transactionDate).getTime() / 1000}|${tx.totalTtc}|${tx.paymentMethod}|${JSON.stringify(tx.items)}`;
      const calculatedHash = crypto.createHash('sha256').update(dataToHash).digest('hex');

      if (calculatedHash !== tx.currentHash) {
        await this.auditService.log({
          tenantId,
          eventType: 'HASH_VERIFICATION_FAILED',
          resourceType: 'transaction',
          resourceId: tx.uuid,
          metadata: {
            expected: calculatedHash,
            actual: tx.currentHash,
            reason: 'hash_mismatch',
          },
        });

        return {
          isValid: false,
          totalChecked,
          firstErrorId: tx.id,
          firstErrorHash: tx.currentHash,
        };
      }

      previousHash = tx.currentHash;
    }

    return {
      isValid: true,
      totalChecked,
    };
  }

  /**
   * Créer un remboursement
   */
  async createRefund(
    originalTransactionUuid: string,
    tenantId: string,
    operatorId: string,
    reason?: string,
  ): Promise<Transaction> {
    const original = await this.findOne(originalTransactionUuid, tenantId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      // Créer la transaction de remboursement (montants négatifs)
      const refund = this.transactionRepo.create({
        tenantId,
        registerId: original.registerId,
        operatorId,
        transactionType: 'refund',
        status: 'completed',
        totalHt: -original.totalHt,
        totalVat: -original.totalVat,
        totalTtc: -original.totalTtc,
        vatDetails: this.negateVatDetails(original.vatDetails),
        items: original.items.map((item) => ({ ...item, quantity: -item.quantity })),
        paymentMethod: original.paymentMethod,
        customerEmail: original.customerEmail,
        customerPhone: original.customerPhone,
        customerName: original.customerName,
        metadata: {
          originalTransactionUuid,
          refundReason: reason,
        },
        uuid: crypto.randomUUID(),
      });

      const saved = await queryRunner.manager.save(refund);

      await this.auditService.log({
        tenantId,
        userId: operatorId,
        eventType: 'TRANSACTION_REFUNDED',
        resourceType: 'transaction',
        resourceId: saved.uuid,
        metadata: {
          originalTransactionUuid,
          reason,
        },
      });

      await queryRunner.commitTransaction();

      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(`Échec du remboursement: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  private negateVatDetails(vatDetails: Record<string, any>): Record<string, any> {
    const negated: Record<string, any> = {};
    Object.keys(vatDetails).forEach((rate) => {
      negated[rate] = {
        ht: -vatDetails[rate].ht,
        vat: -vatDetails[rate].vat,
        ttc: -vatDetails[rate].ttc,
      };
    });
    return negated;
  }

  /**
   * Statistiques de transaction
   */
  async getStats(tenantId: string, startDate: Date, endDate: Date) {
    const transactions = await this.findByPeriod(tenantId, startDate, endDate);

    const stats = {
      totalTransactions: transactions.length,
      totalSales: transactions.filter((t) => t.transactionType === 'sale').length,
      totalRefunds: transactions.filter((t) => t.transactionType === 'refund').length,
      totalRevenue: transactions
        .filter((t) => t.transactionType === 'sale')
        .reduce((sum, t) => sum + Number(t.totalTtc), 0),
      totalRefunded: Math.abs(
        transactions
          .filter((t) => t.transactionType === 'refund')
          .reduce((sum, t) => sum + Number(t.totalTtc), 0),
      ),
      paymentMethods: this.groupByPaymentMethod(transactions),
      vatBreakdown: this.aggregateVatDetails(transactions),
    };

    return stats;
  }

  private groupByPaymentMethod(transactions: Transaction[]): Record<string, number> {
    const grouped: Record<string, number> = {};
    transactions.forEach((tx) => {
      if (!grouped[tx.paymentMethod]) {
        grouped[tx.paymentMethod] = 0;
      }
      grouped[tx.paymentMethod] += Number(tx.totalTtc);
    });
    return grouped;
  }

  private aggregateVatDetails(transactions: Transaction[]): Record<string, any> {
    const aggregated: Record<string, any> = {};
    transactions.forEach((tx) => {
      Object.keys(tx.vatDetails).forEach((rate) => {
        if (!aggregated[rate]) {
          aggregated[rate] = { ht: 0, vat: 0, ttc: 0 };
        }
        aggregated[rate].ht += tx.vatDetails[rate].ht;
        aggregated[rate].vat += tx.vatDetails[rate].vat;
        aggregated[rate].ttc += tx.vatDetails[rate].ttc;
      });
    });
    return aggregated;
  }
}
