import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency (Euro)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

/**
 * Format date
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * Format date (short)
 */
export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
}

/**
 * Get VAT rate percentage
 */
export function getVatRate(rate: string): number {
  const rates: Record<string, number> = {
    standard: 20.0,
    intermediate: 10.0,
    reduced: 5.5,
    super_reduced: 5.5,
    minimum: 2.1,
  };
  return rates[rate] || 20.0;
}

/**
 * Get VAT rate label
 */
export function getVatRateLabel(rate: string): string {
  const labels: Record<string, string> = {
    standard: '20%',
    intermediate: '10%',
    reduced: '5,5%',
    super_reduced: '5,5%',
    minimum: '2,1%',
  };
  return labels[rate] || '20%';
}

/**
 * Get payment method label
 */
export function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    cash: 'Espèces',
    card: 'Carte Bancaire',
    check: 'Chèque',
    transfer: 'Virement',
    voucher: 'Ticket Restaurant',
    mobile: 'Paiement Mobile',
  };
  return labels[method] || method;
}

/**
 * Calculate total TTC from items
 */
export function calculateTotal(
  items: Array<{ price: number; quantity: number }>
): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/**
 * Check if today's closure is done
 */
export function isTodayClosureDone(closures: Array<{ closureDate: string }>): boolean {
  const today = new Date().toISOString().split('T')[0];
  return closures.some((c) => c.closureDate.startsWith(today));
}

/**
 * Generate receipt number
 */
export function generateReceiptNumber(transactionNumber: number): string {
  const date = new Date();
  const year = date.getFullYear();
  const num = String(transactionNumber).padStart(10, '0');
  return `${year}-${num}`;
}

/**
 * Check if hash chain is valid
 */
export function validateHash(hash: string): boolean {
  return /^[a-f0-9]{64}$/.test(hash);
}
