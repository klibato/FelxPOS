import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { DailyClosure } from './entities/daily-closure.entity';
import { TransactionsService } from '../transactions/transactions.service';
import { AuditService } from '../audit/audit.service';
import { ArchiveService } from '../archive/archive.service';
import * as crypto from 'crypto';
import { startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class ClosuresService {
  constructor(
    @InjectRepository(DailyClosure)
    private closureRepo: Repository<DailyClosure>,
    private transactionsService: TransactionsService,
    private auditService: AuditService,
    private archiveService: ArchiveService,
  ) {}

  /**
   * Effectuer la clôture journalière (obligatoire NF525)
   */
  async performDailyClosure(
    tenantId: string,
    registerId: string,
    date: Date,
    operatorId?: string,
  ): Promise<DailyClosure> {
    const closureDate = new Date(date);
    closureDate.setHours(0, 0, 0, 0);

    // Vérifier qu'aucune clôture n'existe déjà
    const existing = await this.closureRepo.findOne({
      where: {
        tenantId,
        registerId,
        closureDate,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Une clôture existe déjà pour le ${closureDate.toLocaleDateString()}`,
      );
    }

    // Récupérer toutes les transactions du jour
    const startDate = startOfDay(date);
    const endDate = endOfDay(date);

    const transactions = await this.transactionsService.findByPeriod(
      tenantId,
      startDate,
      endDate,
      registerId,
    );

    if (transactions.length === 0) {
      throw new BadRequestException('Aucune transaction à clôturer pour cette date');
    }

    // Vérifier l'intégrité de la chaîne de hash
    const verification = await this.transactionsService.verifyHashChain(tenantId, startDate, endDate);

    if (!verification.isValid) {
      throw new BadRequestException(
        `La chaîne de hash est corrompue. Transaction en erreur: ${verification.firstErrorId}`,
      );
    }

    // Calculer les statistiques
    const stats = await this.calculateClosureStats(transactions);

    // Créer la clôture
    const closure = this.closureRepo.create({
      tenantId,
      registerId,
      operatorId,
      closureDate,
      totalTransactions: transactions.length,
      totalSales: stats.totalSales,
      totalRefunds: stats.totalRefunds,
      totalVoids: stats.totalVoids,
      totalHt: stats.totalHt,
      totalVat: stats.totalVat,
      totalTtc: stats.totalTtc,
      vatBreakdown: stats.vatBreakdown,
      paymentBreakdown: stats.paymentBreakdown,
      firstTransactionHash: transactions[0].currentHash,
      lastTransactionHash: transactions[transactions.length - 1].currentHash,
      isVerified: true,
      verificationDate: new Date(),
    });

    // Le trigger DB calculera le closure_hash automatiquement
    const saved = await this.closureRepo.save(closure);

    // Logger dans l'audit
    await this.auditService.log({
      tenantId,
      userId: operatorId,
      eventType: 'CLOSURE_PERFORMED',
      resourceType: 'closure',
      resourceId: saved.id,
      newValues: {
        closureDate,
        totalTransactions: saved.totalTransactions,
        totalTtc: saved.totalTtc,
      },
    });

    // Archiver de manière asynchrone (ne bloque pas la réponse)
    this.archiveClosureAsync(saved.id, tenantId).catch((error) => {
      console.error('Erreur lors de l\'archivage:', error);
      this.auditService.logError({
        tenantId,
        eventType: 'ARCHIVE_ERROR',
        error: error.message,
        metadata: { closureId: saved.id },
      });
    });

    return saved;
  }

  /**
   * Calculer les statistiques de clôture
   */
  private async calculateClosureStats(transactions: any[]) {
    let totalSales = 0;
    let totalRefunds = 0;
    let totalVoids = 0;
    let totalHt = 0;
    let totalVat = 0;
    let totalTtc = 0;

    const vatBreakdown: Record<string, any> = {};
    const paymentBreakdown: Record<string, number> = {};

    transactions.forEach((tx) => {
      // Compter par type
      if (tx.transactionType === 'sale') totalSales++;
      else if (tx.transactionType === 'refund') totalRefunds++;
      else if (tx.transactionType === 'void') totalVoids++;

      // Totaux financiers
      totalHt += Number(tx.totalHt);
      totalVat += Number(tx.totalVat);
      totalTtc += Number(tx.totalTtc);

      // Répartition TVA
      Object.keys(tx.vatDetails).forEach((rate) => {
        if (!vatBreakdown[rate]) {
          vatBreakdown[rate] = { ht: 0, vat: 0, ttc: 0 };
        }
        vatBreakdown[rate].ht += tx.vatDetails[rate].ht;
        vatBreakdown[rate].vat += tx.vatDetails[rate].vat;
        vatBreakdown[rate].ttc += tx.vatDetails[rate].ttc;
      });

      // Répartition paiement
      if (!paymentBreakdown[tx.paymentMethod]) {
        paymentBreakdown[tx.paymentMethod] = 0;
      }
      paymentBreakdown[tx.paymentMethod] += Number(tx.totalTtc);
    });

    // Arrondir
    totalHt = Math.round(totalHt * 100) / 100;
    totalVat = Math.round(totalVat * 100) / 100;
    totalTtc = Math.round(totalTtc * 100) / 100;

    return {
      totalSales,
      totalRefunds,
      totalVoids,
      totalHt,
      totalVat,
      totalTtc,
      vatBreakdown,
      paymentBreakdown,
    };
  }

  /**
   * Archiver une clôture (asynchrone)
   */
  private async archiveClosureAsync(closureId: string, tenantId: string): Promise<void> {
    const closure = await this.closureRepo.findOne({
      where: { id: closureId },
      relations: ['register', 'tenant'],
    });

    if (!closure) {
      throw new Error('Clôture non trouvée');
    }

    // Archiver dans R2
    const archiveUrl = await this.archiveService.archiveClosure(closure);

    // Mettre à jour la clôture avec l'URL d'archive
    await this.closureRepo.update(closureId, {
      archiveUrl,
      archivedAt: new Date(),
    });

    // Logger
    await this.auditService.log({
      tenantId,
      eventType: 'CLOSURE_ARCHIVED',
      resourceType: 'closure',
      resourceId: closureId,
      metadata: { archiveUrl },
    });
  }

  /**
   * Récupérer une clôture
   */
  async findOne(id: string, tenantId: string): Promise<DailyClosure> {
    return this.closureRepo.findOne({
      where: { id, tenantId },
      relations: ['register', 'operator'],
    });
  }

  /**
   * Récupérer toutes les clôtures d'un tenant
   */
  async findAll(tenantId: string, limit = 50, offset = 0): Promise<DailyClosure[]> {
    return this.closureRepo.find({
      where: { tenantId },
      order: { closureDate: 'DESC' },
      take: limit,
      skip: offset,
      relations: ['register'],
    });
  }

  /**
   * Récupérer les clôtures non archivées
   */
  async findUnarchived(tenantId: string): Promise<DailyClosure[]> {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    return this.closureRepo
      .createQueryBuilder('closure')
      .where('closure.tenant_id = :tenantId', { tenantId })
      .andWhere('closure.archived_at IS NULL')
      .andWhere('closure.created_at < :oneDayAgo', { oneDayAgo })
      .getMany();
  }

  /**
   * Clôture automatique pour toutes les caisses (schedulée)
   */
  async performAutoClosures(): Promise<void> {
    // Cette méthode sera appelée par un CRON job
    // Elle clôture automatiquement toutes les caisses actives
    // Implémentation à venir avec @nestjs/schedule
    console.log('Auto-closures démarrées...');
  }
}
