import { RoomData, RoomCategory, RoomStatus, PriceBreakdown } from '../types/hotel';

/**
 * Object-Oriented Room Entity
 * Encapsulates room properties, availability logic, and pricing calculations.
 */
export class Room implements RoomData {
  public id: string;
  public roomNumber: string;
  public category: RoomCategory;
  public name: string;
  public description: string;
  public pricePerNight: number;
  public maxGuests: number;
  public sizeSqFt: number;
  public bedType: string;
  public floor: number;
  public images: string[];
  public amenities: string[];
  public status: RoomStatus;
  public rating: number;
  public reviewsCount: number;

  constructor(data: RoomData) {
    this.id = data.id;
    this.roomNumber = data.roomNumber;
    this.category = data.category;
    this.name = data.name;
    this.description = data.description;
    this.pricePerNight = data.pricePerNight;
    this.maxGuests = data.maxGuests;
    this.sizeSqFt = data.sizeSqFt;
    this.bedType = data.bedType;
    this.floor = data.floor;
    this.images = data.images;
    this.amenities = data.amenities;
    this.status = data.status;
    this.rating = data.rating;
    this.reviewsCount = data.reviewsCount;
  }

  /**
   * Calculates stay pricing breakdown for a given number of nights.
   */
  public calculatePrice(nights: number, discountPercentage: number = 0): PriceBreakdown {
    const validNights = Math.max(1, nights);
    const roomTotal = this.pricePerNight * validNights;
    const discount = (roomTotal * discountPercentage) / 100;
    const discountedRoomTotal = roomTotal - discount;
    const taxAmount = Math.round(discountedRoomTotal * 0.12 * 100) / 100; // 12% tax
    const resortFee = validNights * 25; // $25 resort fee per night
    const cleaningFee = this.category === 'Penthouse' ? 100 : this.category === 'Suite' ? 50 : 25;
    const grandTotal = Math.round((discountedRoomTotal + taxAmount + resortFee + cleaningFee) * 100) / 100;

    return {
      pricePerNight: this.pricePerNight,
      nights: validNights,
      roomTotal,
      taxAmount,
      resortFee,
      cleaningFee,
      discount,
      grandTotal,
    };
  }

  /**
   * Checks whether this room accommodates the requested guest count.
   */
  public canAccommodate(guestsCount: number): boolean {
    return guestsCount <= this.maxGuests;
  }

  /**
   * Checks date overlaps against existing booked reservations.
   */
  public isAvailableForDates(
    checkInStr: string,
    checkOutStr: string,
    existingReservations: { checkInDate: string; checkOutDate: string; status: string }[]
  ): boolean {
    if (this.status === 'Maintenance') {
      return false;
    }

    const start = new Date(checkInStr).getTime();
    const end = new Date(checkOutStr).getTime();

    if (isNaN(start) || isNaN(end) || start >= end) {
      return false;
    }

    for (const res of existingReservations) {
      if (res.status === 'Cancelled') continue;
      const resStart = new Date(res.checkInDate).getTime();
      const resEnd = new Date(res.checkOutDate).getTime();

      // Overlap condition: start < resEnd && end > resStart
      if (start < resEnd && end > resStart) {
        return false;
      }
    }

    return true;
  }
}
