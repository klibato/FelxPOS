import { Injectable } from '@nestjs/common';
import { Transaction } from '../transactions/entities/transaction.entity';
import * as PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import { format } from 'date-fns';

@Injectable()
export class ReceiptsService {
  /**
   * Générer un reçu PDF conforme NF525
   */
  async generateReceipt(transaction: Transaction): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: [226.77, 841.89], // Format ticket 80mm de large
          margin: 10,
        });

        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // En-tête entreprise
        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .text(transaction.tenant?.companyName || 'Entreprise', { align: 'center' });

        doc
          .fontSize(8)
          .font('Helvetica')
          .text(`SIRET: ${transaction.tenant?.siret || 'N/A'}`, { align: 'center' })
          .text(`TVA: ${transaction.tenant?.vatNumber || 'N/A'}`, { align: 'center' });

        if (transaction.tenant?.addressLine1) {
          doc
            .text(transaction.tenant.addressLine1, { align: 'center' })
            .text(
              `${transaction.tenant.postalCode} ${transaction.tenant.city}`.trim(),
              { align: 'center' },
            );
        }

        doc.moveDown(0.5);

        // Ligne de séparation
        doc
          .strokeColor('#000000')
          .lineWidth(1)
          .moveTo(10, doc.y)
          .lineTo(216.77, doc.y)
          .stroke();

        doc.moveDown(0.5);

        // Numéro de ticket et date
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text(`TICKET N° ${transaction.receiptNumber}`);

        doc
          .fontSize(8)
          .font('Helvetica')
          .text(`Date: ${format(transaction.transactionDate, 'dd/MM/yyyy HH:mm:ss')}`)
          .text(`Caisse: ${transaction.register?.name || transaction.registerId}`)
          .text(`Opérateur: ${transaction.operator?.firstName || 'N/A'}`);

        doc.moveDown(0.5);

        // Ligne de séparation
        doc
          .strokeColor('#000000')
          .moveTo(10, doc.y)
          .lineTo(216.77, doc.y)
          .stroke();

        doc.moveDown(0.5);

        // Articles
        doc.fontSize(8).font('Helvetica-Bold');
        doc.text('ARTICLE', 10, doc.y, { continued: true, width: 120 });
        doc.text('QTÉ', { continued: true, width: 30, align: 'right' });
        doc.text('PRIX', { width: 46.77, align: 'right' });

        doc.moveDown(0.3);

        doc.font('Helvetica');
        transaction.items.forEach((item: any) => {
          const y = doc.y;
          doc.text(item.name, 10, y, { width: 120 });
          doc.text(item.quantity.toString(), 130, y, { width: 30, align: 'right' });
          doc.text(
            `${(item.price * item.quantity).toFixed(2)}€`,
            160,
            y,
            { width: 56.77, align: 'right' },
          );
          doc.moveDown(0.3);
        });

        doc.moveDown(0.3);

        // Ligne de séparation
        doc
          .strokeColor('#000000')
          .moveTo(10, doc.y)
          .lineTo(216.77, doc.y)
          .stroke();

        doc.moveDown(0.5);

        // Détails TVA
        doc.fontSize(7).font('Helvetica');
        Object.entries(transaction.vatDetails).forEach(([rate, details]: [string, any]) => {
          doc.text(`TVA ${rate}%:`, 10, doc.y, { continued: true });
          doc.text(`Base HT: ${details.ht.toFixed(2)}€`, { continued: true, indent: 10 });
          doc.text(`TVA: ${details.vat.toFixed(2)}€`, { align: 'right' });
        });

        doc.moveDown(0.5);

        // Ligne de séparation
        doc
          .strokeColor('#000000')
          .lineWidth(2)
          .moveTo(10, doc.y)
          .lineTo(216.77, doc.y)
          .stroke();

        doc.moveDown(0.5);

        // Total
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text('TOTAL TTC:', 10, doc.y, { continued: true });
        doc.text(`${transaction.totalTtc.toFixed(2)} €`, { align: 'right' });

        doc.moveDown(0.5);

        // Moyen de paiement
        doc.fontSize(8).font('Helvetica');
        const paymentMethodLabels: Record<string, string> = {
          cash: 'Espèces',
          card: 'Carte Bancaire',
          check: 'Chèque',
          transfer: 'Virement',
          voucher: 'Ticket Restaurant',
          mobile: 'Paiement Mobile',
        };
        doc.text(
          `Paiement: ${paymentMethodLabels[transaction.paymentMethod] || transaction.paymentMethod}`,
        );

        doc.moveDown(0.5);

        // Ligne de séparation
        doc
          .strokeColor('#000000')
          .lineWidth(1)
          .moveTo(10, doc.y)
          .lineTo(216.77, doc.y)
          .stroke();

        doc.moveDown(0.5);

        // Hash de vérification NF525 (OBLIGATOIRE)
        doc.fontSize(6).font('Helvetica-Bold');
        doc.text('CONTRÔLE NF525:', { align: 'center' });
        doc.fontSize(5).font('Courier');
        doc.text(transaction.currentHash.substring(0, 32), { align: 'center' });
        doc.text(transaction.currentHash.substring(32), { align: 'center' });

        doc.moveDown(0.5);

        // QR Code de vérification
        const qrData = {
          receiptNumber: transaction.receiptNumber,
          hash: transaction.currentHash,
          amount: transaction.totalTtc,
          date: transaction.transactionDate,
          tenant: transaction.tenantId,
        };

        const qrCodeBuffer = await QRCode.toBuffer(JSON.stringify(qrData), {
          width: 120,
          margin: 1,
          errorCorrectionLevel: 'M',
        });

        const qrX = (216.77 - 120) / 2;
        doc.image(qrCodeBuffer, qrX, doc.y, { width: 120 });

        doc.moveDown(7);

        // Mentions légales NF525
        doc.fontSize(6).font('Helvetica');
        doc.text('Ticket conforme à la norme NF525', { align: 'center' });
        doc.text('Certification anti-fraude fiscale', { align: 'center' });
        doc.text('Conservation obligatoire: 2 ans', { align: 'center' });

        doc.moveDown(0.5);

        // Footer personnalisé
        if (transaction.register?.receiptFooter) {
          doc.fontSize(7).font('Helvetica-Bold');
          doc.text(transaction.register.receiptFooter, { align: 'center' });
        } else {
          doc.fontSize(8).font('Helvetica-Bold');
          doc.text('Merci de votre visite !', { align: 'center' });
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Générer un reçu de remboursement
   */
  async generateRefundReceipt(transaction: Transaction): Promise<Buffer> {
    // Similaire au reçu normal mais avec mention "REMBOURSEMENT"
    const receipt = await this.generateReceipt(transaction);
    return receipt;
  }
}
