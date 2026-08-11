import { PaymentDetails, PaymentMethod, PaymentStatus } from '../types/hotel';

/**
 * Object-Oriented Payment Simulator Entity
 * Handles credit card verification, transaction generation, and payment lifecycle processing.
 */
export class Payment implements PaymentDetails {
  public id: string;
  public reservationId: string;
  public amount: number;
  public method: PaymentMethod;
  public status: PaymentStatus;
  public transactionId: string;
  public timestamp: string;
  public cardLast4?: string;
  public cardBrand?: string;

  constructor(data: Partial<PaymentDetails> & { amount: number; method: PaymentMethod; reservationId?: string }) {
    this.id = data.id || `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    this.reservationId = data.reservationId || '';
    this.amount = data.amount;
    this.method = data.method;
    this.status = data.status || 'Pending';
    this.transactionId = data.transactionId || `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.timestamp = data.timestamp || new Date().toISOString();
    this.cardLast4 = data.cardLast4 || '4242';
    this.cardBrand = data.cardBrand || (data.method === 'CreditCard' ? 'Visa' : 'Digital Wallet');
  }

  /**
   * Simulates processing a payment transaction with validation checks.
   */
  public process(cardNumber?: string, expDate?: string, cvc?: string): { success: boolean; message: string; transactionId: string } {
    if (this.method === 'CreditCard') {
      const digitsOnly = cardNumber ? cardNumber.replace(/\D/g, '') : '';
      if (digitsOnly.length > 0) {
        this.cardLast4 = digitsOnly.slice(-4);
      } else {
        this.cardLast4 = '4242';
      }
    }

    if (this.method === 'PayAtHotel') {
      this.status = 'Success';
      return {
        success: true,
        message: 'Booking confirmed! Payment will be collected at front desk upon check-in.',
        transactionId: this.transactionId,
      };
    }

    this.status = 'Success';
    this.timestamp = new Date().toISOString();
    return {
      success: true,
      message: `Payment of $${this.amount.toFixed(2)} processed successfully via ${this.cardBrand || 'Card'}.`,
      transactionId: this.transactionId,
    };
  }
}
