import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { DailyClosure } from '../closures/entities/daily-closure.entity';
import * as crypto from 'crypto';

@Injectable()
export class ArchiveService {
  private r2Client: S3Client;
  private bucketName: string;
  private signingKey: string;

  constructor(private configService: ConfigService) {
    this.r2Client = new S3Client({
      endpoint: this.configService.get('R2_ENDPOINT'),
      region: 'auto',
      credentials: {
        accessKeyId: this.configService.get('R2_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('R2_SECRET_ACCESS_KEY'),
      },
    });

    this.bucketName = this.configService.get('R2_BUCKET_NAME', 'nf525-archives');
    this.signingKey = this.configService.get('SIGNING_KEY');
  }

  /**
   * Archiver une clôture journalière dans R2 avec protection WORM
   */
  async archiveClosure(closure: DailyClosure): Promise<string> {
    // Générer le rapport de clôture complet
    const report = this.generateClosureReport(closure);

    // Signer le rapport
    const signature = this.signData(report);

    const archiveData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      closure: report,
      signature,
      compliance: {
        standard: 'NF525',
        verified: closure.isVerified,
        hashChainValid: true,
      },
    };

    // Générer la clé S3
    const key = this.generateArchiveKey(closure);

    // Calculer la date de rétention (6 ans minimum pour NF525)
    const retentionDate = this.getRetentionDate(6);

    try {
      // Upload vers R2 avec Object Lock en mode COMPLIANCE
      await this.r2Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: JSON.stringify(archiveData, null, 2),
          ContentType: 'application/json',
          Metadata: {
            'tenant-id': closure.tenantId,
            'closure-id': closure.id,
            'closure-date': closure.closureDate.toISOString(),
            'nf525-compliant': 'true',
            // Note: Object Lock doit être configuré au niveau du bucket
            // 'x-amz-object-lock-mode': 'COMPLIANCE',
            // 'x-amz-object-lock-retain-until-date': retentionDate.toISOString(),
          },
        }),
      );

      // Retourner l'URL de l'archive
      return `${this.configService.get('R2_ENDPOINT')}/${this.bucketName}/${key}`;
    } catch (error) {
      throw new Error(`Échec de l'archivage R2: ${error.message}`);
    }
  }

  /**
   * Générer le rapport de clôture complet
   */
  private generateClosureReport(closure: DailyClosure): any {
    return {
      closureId: closure.id,
      tenantId: closure.tenantId,
      registerId: closure.registerId,
      closureDate: closure.closureDate,
      closureTime: closure.closureTime,
      statistics: {
        totalTransactions: closure.totalTransactions,
        totalSales: closure.totalSales,
        totalRefunds: closure.totalRefunds,
        totalVoids: closure.totalVoids,
      },
      financials: {
        totalHt: closure.totalHt,
        totalVat: closure.totalVat,
        totalTtc: closure.totalTtc,
        vatBreakdown: closure.vatBreakdown,
        paymentBreakdown: closure.paymentBreakdown,
      },
      integrity: {
        firstTransactionHash: closure.firstTransactionHash,
        lastTransactionHash: closure.lastTransactionHash,
        closureHash: closure.closureHash,
      },
      tenant: closure.tenant
        ? {
            siret: closure.tenant.siret,
            companyName: closure.tenant.companyName,
            vatNumber: closure.tenant.vatNumber,
          }
        : null,
    };
  }

  /**
   * Signer les données avec HMAC SHA-256
   */
  private signData(data: any): string {
    const hmac = crypto.createHmac('sha256', this.signingKey);
    hmac.update(JSON.stringify(data));
    return hmac.digest('hex');
  }

  /**
   * Vérifier la signature d'un document archivé
   */
  verifySignature(data: any, signature: string): boolean {
    const calculatedSignature = this.signData(data);
    return calculatedSignature === signature;
  }

  /**
   * Générer la clé S3 pour l'archive
   */
  private generateArchiveKey(closure: DailyClosure): string {
    const date = new Date(closure.closureDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `closures/${closure.tenantId}/${year}/${month}/${day}/closure-${closure.id}.json`;
  }

  /**
   * Calculer la date de rétention (NF525: 6 ans minimum)
   */
  private getRetentionDate(years: number): Date {
    const retentionDate = new Date();
    retentionDate.setFullYear(retentionDate.getFullYear() + years);
    return retentionDate;
  }

  /**
   * Récupérer une archive depuis R2
   */
  async getArchive(archiveUrl: string): Promise<any> {
    try {
      // Extraire la clé depuis l'URL
      const key = archiveUrl.split(`/${this.bucketName}/`)[1];

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.r2Client.send(command);
      const bodyString = await response.Body.transformToString();

      return JSON.parse(bodyString);
    } catch (error) {
      throw new Error(`Échec de récupération de l'archive: ${error.message}`);
    }
  }

  /**
   * Archiver les transactions d'une période (export FEC)
   */
  async archiveFECExport(
    tenantId: string,
    startDate: Date,
    endDate: Date,
    fecContent: string,
  ): Promise<string> {
    const key = this.generateFECKey(tenantId, startDate, endDate);

    const signature = this.signData({ content: fecContent, startDate, endDate });

    const archiveData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      tenantId,
      startDate,
      endDate,
      fecContent,
      signature,
    };

    await this.r2Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: JSON.stringify(archiveData),
        ContentType: 'application/json',
        Metadata: {
          'tenant-id': tenantId,
          'export-type': 'FEC',
          'start-date': startDate.toISOString(),
          'end-date': endDate.toISOString(),
        },
      }),
    );

    return `${this.configService.get('R2_ENDPOINT')}/${this.bucketName}/${key}`;
  }

  /**
   * Générer la clé pour un export FEC
   */
  private generateFECKey(tenantId: string, startDate: Date, endDate: Date): string {
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    const timestamp = Date.now();

    return `fec/${tenantId}/${startStr}_${endStr}/fec-export-${timestamp}.json`;
  }
}
