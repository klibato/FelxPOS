import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transaction } from '../transactions/entities/transaction.entity';
import { ArchiveService } from '../archive/archive.service';
import { format } from 'date-fns';

@Injectable()
export class FECService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    private archiveService: ArchiveService,
  ) {}

  /**
   * Générer un export FEC (Fichier des Écritures Comptables)
   * Format obligatoire pour l'administration fiscale française
   */
  async generateFEC(tenantId: string, startDate: Date, endDate: Date): Promise<string> {
    // Récupérer toutes les transactions de la période
    const transactions = await this.transactionRepo.find({
      where: {
        tenantId,
        transactionDate: Between(startDate, endDate),
      },
      order: { transactionDate: 'ASC', transactionNumber: 'ASC' },
      relations: ['tenant'],
    });

    if (transactions.length === 0) {
      throw new Error('Aucune transaction trouvée pour cette période');
    }

    // En-têtes FEC (18 colonnes obligatoires)
    const headers = [
      'JournalCode',
      'JournalLib',
      'EcritureNum',
      'EcritureDate',
      'CompteNum',
      'CompteLib',
      'CompAuxNum',
      'CompAuxLib',
      'PieceRef',
      'PieceDate',
      'EcritureLib',
      'Debit',
      'Credit',
      'EcritureLet',
      'DateLet',
      'ValidDate',
      'Montantdevise',
      'Idevise',
    ];

    const rows: string[] = [];
    rows.push(headers.join('|'));

    // Générer les écritures comptables
    transactions.forEach((tx) => {
      const ecritureDate = format(tx.transactionDate, 'yyyyMMdd');
      const pieceDate = format(tx.transactionDate, 'yyyyMMdd');
      const validDate = format(tx.transactionDate, 'yyyyMMdd');

      // Ligne 1: Débit du compte de trésorerie (512000)
      rows.push(
        [
          'VE', // JournalCode
          'Ventes', // JournalLib
          tx.transactionNumber.toString(), // EcritureNum
          ecritureDate, // EcritureDate
          this.getAccountNumber(tx.paymentMethod), // CompteNum (512000 = Banque, 530000 = Caisse)
          this.getAccountLabel(tx.paymentMethod), // CompteLib
          '', // CompAuxNum
          '', // CompAuxLib
          tx.receiptNumber, // PieceRef
          pieceDate, // PieceDate
          `Vente ${tx.receiptNumber}`, // EcritureLib
          this.formatAmount(tx.totalTtc), // Debit
          '0,00', // Credit
          '', // EcritureLet
          '', // DateLet
          validDate, // ValidDate
          '', // Montantdevise
          '', // Idevise
        ].join('|'),
      );

      // Lignes 2+: Crédits par taux de TVA
      Object.entries(tx.vatDetails).forEach(([rate, details]: [string, any]) => {
        if (details.vat > 0) {
          // Ligne TVA collectée
          rows.push(
            [
              'VE',
              'Ventes',
              tx.transactionNumber.toString(),
              ecritureDate,
              this.getVATAccount(rate), // 445710 + variant
              `TVA collectée ${rate}%`,
              '',
              '',
              tx.receiptNumber,
              pieceDate,
              `TVA ${rate}%`,
              '0,00',
              this.formatAmount(details.vat),
              '',
              '',
              validDate,
              '',
              '',
            ].join('|'),
          );
        }
      });

      // Ligne 3: Crédit du compte de vente HT (701000)
      rows.push(
        [
          'VE',
          'Ventes',
          tx.transactionNumber.toString(),
          ecritureDate,
          '701000', // CompteNum (Ventes de produits finis)
          'Ventes de produits finis',
          '',
          '',
          tx.receiptNumber,
          pieceDate,
          `Vente HT ${tx.receiptNumber}`,
          '0,00',
          this.formatAmount(tx.totalHt),
          '',
          '',
          validDate,
          '',
          '',
        ].join('|'),
      );

      // Si c'est un remboursement, inverser les débits/crédits
      if (tx.transactionType === 'refund') {
        // Logique d'inversion à implémenter si nécessaire
      }
    });

    const fecContent = rows.join('\n');

    // Archiver l'export FEC dans R2
    await this.archiveService.archiveFECExport(tenantId, startDate, endDate, fecContent);

    return fecContent;
  }

  /**
   * Obtenir le numéro de compte selon le moyen de paiement
   */
  private getAccountNumber(paymentMethod: string): string {
    const accounts: Record<string, string> = {
      cash: '530000', // Caisse
      card: '512000', // Banque
      check: '512000', // Banque
      transfer: '512000', // Banque
      voucher: '512000', // Banque
      mobile: '512000', // Banque
    };
    return accounts[paymentMethod] || '512000';
  }

  /**
   * Obtenir le libellé du compte
   */
  private getAccountLabel(paymentMethod: string): string {
    const labels: Record<string, string> = {
      cash: 'Caisse',
      card: 'Banque',
      check: 'Banque',
      transfer: 'Banque',
      voucher: 'Banque',
      mobile: 'Banque',
    };
    return labels[paymentMethod] || 'Banque';
  }

  /**
   * Obtenir le compte de TVA selon le taux
   */
  private getVATAccount(rate: string): string {
    const accounts: Record<string, string> = {
      '20': '445710', // TVA collectée 20%
      '10': '445711', // TVA collectée 10%
      '5.5': '445712', // TVA collectée 5,5%
      '2.1': '445713', // TVA collectée 2,1%
    };
    return accounts[rate] || '445710';
  }

  /**
   * Formater un montant au format FEC (virgule comme séparateur décimal)
   */
  private formatAmount(amount: number): string {
    const rounded = Math.round(amount * 100) / 100;
    return rounded.toFixed(2).replace('.', ',');
  }

  /**
   * Vérifier l'équilibre du FEC (Débit total = Crédit total)
   */
  async verifyFECBalance(fecContent: string): Promise<{
    isBalanced: boolean;
    debitTotal: number;
    creditTotal: number;
  }> {
    const lines = fecContent.split('\n').slice(1); // Ignorer l'en-tête

    let debitTotal = 0;
    let creditTotal = 0;

    lines.forEach((line) => {
      if (!line.trim()) return;

      const cols = line.split('|');
      if (cols.length >= 13) {
        const debit = parseFloat(cols[11].replace(',', '.')) || 0;
        const credit = parseFloat(cols[12].replace(',', '.')) || 0;

        debitTotal += debit;
        creditTotal += credit;
      }
    });

    // Arrondir à 2 décimales
    debitTotal = Math.round(debitTotal * 100) / 100;
    creditTotal = Math.round(creditTotal * 100) / 100;

    return {
      isBalanced: Math.abs(debitTotal - creditTotal) < 0.01,
      debitTotal,
      creditTotal,
    };
  }

  /**
   * Générer le nom de fichier FEC selon la norme
   * Format: SIRENFECAAAAMMJJhhmmss.txt
   */
  generateFECFilename(siret: string, date: Date): string {
    const siren = siret.substring(0, 9);
    const timestamp = format(date, 'yyyyMMddHHmmss');
    return `${siren}FEC${timestamp}.txt`;
  }
}
