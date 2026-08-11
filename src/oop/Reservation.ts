import { ReservationData, GuestInfo, PriceBreakdown, PaymentDetails, ReservationStatus } from '../types/hotel';

/**
 * Object-Oriented Reservation Entity
 * Encapsulates booking details, status transitions, confirmation code generation, and refund calculations.
 */
export class Reservation implements ReservationData {
  public id: string;
  public confirmationCode: string;
  public roomId: string;
  public roomSummary: {
    name: string;
    category: any;
    roomNumber: string;
    image: string;
  };
  public guest: GuestInfo;
  public checkInDate: string;
  public checkOutDate: string;
  public guestsCount: number;
  public pricing: PriceBreakdown;
  public payment: PaymentDetails;
  public status: ReservationStatus;
  public cancelledAt?: string;
  public refundAmount?: number;
  public createdAt: string;
  public updatedAt: string;

  constructor(data: ReservationData) {
    this.id = data.id;
    this.confirmationCode = data.confirmationCode || Reservation.generateConfirmationCode();
    this.roomId = data.roomId;
    this.roomSummary = data.roomSummary;
    this.guest = data.guest;
    this.checkInDate = data.checkInDate;
    this.checkOutDate = data.checkOutDate;
    this.guestsCount = data.guestsCount;
    this.pricing = data.pricing;
    this.payment = data.payment;
    this.status = data.status || 'Confirmed';
    this.cancelledAt = data.cancelledAt;
    this.refundAmount = data.refundAmount;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  /**
   * Generates a unique 8-character uppercase alphanumeric booking confirmation code.
   */
  public static generateConfirmationCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'RES-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Calculates total stay duration in nights.
   */
  public getNights(): number {
    const start = new Date(this.checkInDate).getTime();
    const end = new Date(this.checkOutDate).getTime();
    const diff = end - start;
    return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
  }

  /**
   * Cancels the reservation and calculates refund according to hotel cancellation policy:
   * - > 24 hours prior to check-in: 100% refund of grand total
   * - Within 24 hours: 80% refund (20% late cancellation fee)
   */
  public cancel(): { success: boolean; refundAmount: number; policyNotice: string } {
    if (this.status === 'Cancelled') {
      return { success: false, refundAmount: 0, policyNotice: 'Reservation is already cancelled.' };
    }

    const checkInTime = new Date(`${this.checkInDate}T15:00:00`).getTime(); // standard 3:00 PM check-in
    const now = Date.now();
    const hoursUntilCheckIn = (checkInTime - now) / (1000 * 60 * 60);

    let refundPercent = 1.0;
    let policyNotice = 'Full 100% refund processed (Cancellation requested over 24h prior to check-in).';

    if (hoursUntilCheckIn < 24 && hoursUntilCheckIn > 0) {
      refundPercent = 0.8;
      policyNotice = '80% refund processed (20% late cancellation fee applied as check-in is within 24h).';
    } else if (hoursUntilCheckIn <= 0) {
      refundPercent = 0.5;
      policyNotice = '50% partial refund processed (Cancellation on or after scheduled check-in date).';
    }

    const calculatedRefund = Math.round(this.pricing.grandTotal * refundPercent * 100) / 100;

    this.status = 'Cancelled';
    this.refundAmount = calculatedRefund;
    this.payment.status = 'Refunded';
    this.cancelledAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();

    return {
      success: true,
      refundAmount: calculatedRefund,
      policyNotice,
    };
  }
}
