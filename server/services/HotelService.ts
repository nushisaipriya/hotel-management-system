import { FileStorageService } from './FileStorage';
import { Room } from '../../src/oop/Room';
import { Reservation } from '../../src/oop/Reservation';
import { Payment } from '../../src/oop/Payment';
import { RoomData, ReservationData, PaymentDetails, HotelInfo, RoomCategory, AvailabilitySearchQuery } from '../../src/types/hotel';

/**
 * HotelService - OOP Business Logic Service
 * Orchestrates domain models, availability filtering, payment processing,
 * and File I/O persistence.
 */
export class HotelService {
  private static ROOMS_FILE = 'rooms.json';
  private static RESERVATIONS_FILE = 'reservations.json';
  private static PAYMENTS_FILE = 'payments.json';
  private static HOTELS_FILE = 'hotels.json';

  /**
   * Retrieves Hotel details.
   */
  public static async getHotelInfo(): Promise<HotelInfo> {
    const hotels = await FileStorageService.readData<HotelInfo[]>(this.HOTELS_FILE, []);
    return hotels[0] || {
      id: 'hotel-01',
      name: 'Grand Royale Hotel & Spa',
      tagline: '5-Star Luxury Living & Coastal Panoramic Views',
      address: '777 Oceanfront Boulevard',
      city: 'Grand Harbour, CA',
      country: 'United States',
      rating: 4.9,
      totalReviews: 1280,
      phone: '+1 (800) 555-ROYALE',
      email: 'concierge@grandroyalehotel.com',
      checkInTime: '3:00 PM',
      checkOutTime: '11:00 AM',
      description: 'Luxury seaside retreat offering top-tier amenities.',
      policies: ['Check-in from 3:00 PM', 'Free cancellation up to 24 hours prior'],
      heroImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80',
    };
  }

  /**
   * Searches and filters available rooms based on dates, guests, category, and amenities.
   */
  public static async searchRooms(query: AvailabilitySearchQuery) {
    const rawRooms = await FileStorageService.readData<RoomData[]>(this.ROOMS_FILE, []);
    const rawReservations = await FileStorageService.readData<ReservationData[]>(this.RESERVATIONS_FILE, []);

    // Clean up query parameters
    const cleanAmenities = (query.amenities || [])
      .map((a) => (typeof a === 'string' ? a.trim() : ''))
      .filter((a) => a.length > 0);

    const keywordTerm = query.keyword ? query.keyword.toLowerCase().trim() : '';

    // Instantiate OOP Room domain models
    const roomEntities = rawRooms.map((r) => new Room(r));

    let filtered = roomEntities.filter((room) => {
      // Keyword search across room name, description, bed type, category, room number, amenities
      if (keywordTerm) {
        const matchesName = room.name.toLowerCase().includes(keywordTerm);
        const matchesDesc = room.description.toLowerCase().includes(keywordTerm);
        const matchesBed = room.bedType.toLowerCase().includes(keywordTerm);
        const matchesCategory = room.category.toLowerCase().includes(keywordTerm);
        const matchesRoomNumber = room.roomNumber.toLowerCase().includes(keywordTerm);
        const matchesAmenities = room.amenities.some((a) => a.toLowerCase().includes(keywordTerm));

        if (!matchesName && !matchesDesc && !matchesBed && !matchesCategory && !matchesRoomNumber && !matchesAmenities) {
          return false;
        }
      }

      // Category filter
      if (query.category && query.category !== 'All') {
        if (room.category.toLowerCase() !== query.category.toLowerCase()) {
          return false;
        }
      }

      // Guest count capacity check
      if (query.guests && Number(query.guests) > 0) {
        if (!room.canAccommodate(Number(query.guests))) {
          return false;
        }
      }

      // Price range filters
      if (query.minPrice !== undefined && Number(query.minPrice) > 0 && room.pricePerNight < Number(query.minPrice)) {
        return false;
      }
      if (query.maxPrice !== undefined && Number(query.maxPrice) > 0 && room.pricePerNight > Number(query.maxPrice)) {
        return false;
      }

      // Amenities filter (case-insensitive & partial match)
      if (cleanAmenities.length > 0) {
        const hasAll = cleanAmenities.every((reqAmenity) =>
          room.amenities.some((roomAmenity) => roomAmenity.toLowerCase().includes(reqAmenity.toLowerCase()))
        );
        if (!hasAll) return false;
      }

      // Date range availability check using OOP method
      if (query.checkIn && query.checkOut) {
        const start = new Date(query.checkIn).getTime();
        const end = new Date(query.checkOut).getTime();
        // Only run availability check if both dates are valid and checkIn < checkOut
        if (!isNaN(start) && !isNaN(end) && start < end) {
          const roomReservations = rawReservations.filter((res) => res.roomId === room.id);
          const available = room.isAvailableForDates(query.checkIn, query.checkOut, roomReservations);
          if (!available) return false;
        }
      }

      return true;
    });

    // Sorting
    if (query.sortBy === 'price-asc') {
      filtered.sort((a, b) => a.pricePerNight - b.pricePerNight);
    } else if (query.sortBy === 'price-desc') {
      filtered.sort((a, b) => b.pricePerNight - a.pricePerNight);
    } else if (query.sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (query.sortBy === 'size') {
      filtered.sort((a, b) => b.sizeSqFt - a.sizeSqFt);
    }

    return filtered;
  }

  /**
   * Retrieves single room by ID.
   */
  public static async getRoomById(id: string): Promise<Room | null> {
    const rawRooms = await FileStorageService.readData<RoomData[]>(this.ROOMS_FILE, []);
    const found = rawRooms.find((r) => r.id === id);
    return found ? new Room(found) : null;
  }

  /**
   * Creates a new reservation with OOP payment validation and File I/O persistence.
   */
  public static async createReservation(payload: {
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    guestsCount: number;
    guest: any;
    paymentMethod: any;
    cardDetails?: { number?: string; exp?: string; cvc?: string };
    selectedAddons?: { id: string; name: string; price: number }[];
  }): Promise<{ reservation: ReservationData; payment: PaymentDetails }> {
    const room = await this.getRoomById(payload.roomId);
    if (!room) {
      throw new Error('Room not found.');
    }

    // Verify availability for dates
    const rawReservations = await FileStorageService.readData<ReservationData[]>(this.RESERVATIONS_FILE, []);
    const roomReservations = rawReservations.filter((res) => res.roomId === room.id);
    const isAvailable = room.isAvailableForDates(payload.checkInDate, payload.checkOutDate, roomReservations);

    if (!isAvailable) {
      throw new Error('This room is no longer available for the selected dates.');
    }

    // Calculate nights & price breakdown via OOP method
    const start = new Date(payload.checkInDate).getTime();
    const end = new Date(payload.checkOutDate).getTime();
    const nights = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));

    // Apply loyalty discount if VIP or Elite
    let discountPercent = 0;
    if (payload.guest.membershipTier === 'VIP') discountPercent = 10;
    if (payload.guest.membershipTier === 'Elite') discountPercent = 15;

    const pricing = room.calculatePrice(nights, discountPercent);

    // Calculate add-ons
    const addons = payload.selectedAddons || [];
    const addonsTotal = addons.reduce((sum, a) => sum + (Number(a.price) || 0), 0);

    if (addonsTotal > 0) {
      pricing.addonsTotal = addonsTotal;
      pricing.selectedAddons = addons;
      pricing.taxAmount = Math.round((pricing.roomTotal - pricing.discount + addonsTotal) * 0.12 * 100) / 100;
      pricing.grandTotal = Math.round((pricing.roomTotal - pricing.discount + addonsTotal + pricing.taxAmount + pricing.resortFee + pricing.cleaningFee) * 100) / 100;
    }

    // Instantiate Payment simulator domain entity
    const paymentEntity = new Payment({
      amount: pricing.grandTotal,
      method: payload.paymentMethod,
      cardLast4: payload.cardDetails?.number ? payload.cardDetails.number.slice(-4) : '4242',
    });

    const paymentResult = paymentEntity.process(
      payload.cardDetails?.number,
      payload.cardDetails?.exp,
      payload.cardDetails?.cvc
    );

    if (!paymentResult.success) {
      throw new Error(paymentResult.message);
    }

    const resId = `res-${Date.now()}`;
    paymentEntity.reservationId = resId;

    // Instantiate Reservation domain entity
    const reservationEntity = new Reservation({
      id: resId,
      confirmationCode: Reservation.generateConfirmationCode(),
      roomId: room.id,
      roomSummary: {
        name: room.name,
        category: room.category,
        roomNumber: room.roomNumber,
        image: room.images[0],
      },
      guest: payload.guest,
      checkInDate: payload.checkInDate,
      checkOutDate: payload.checkOutDate,
      guestsCount: payload.guestsCount,
      pricing,
      payment: paymentEntity,
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Write to JSON database files via FileStorageService
    rawReservations.push(reservationEntity);
    await FileStorageService.writeData(this.RESERVATIONS_FILE, rawReservations);

    const rawPayments = await FileStorageService.readData<PaymentDetails[]>(this.PAYMENTS_FILE, []);
    rawPayments.push(paymentEntity);
    await FileStorageService.writeData(this.PAYMENTS_FILE, rawPayments);

    return {
      reservation: reservationEntity,
      payment: paymentEntity,
    };
  }

  /**
   * Fetches reservations by confirmation code, email, or returns all.
   */
  public static async getReservations(queryCode?: string, queryEmail?: string) {
    const rawReservations = await FileStorageService.readData<ReservationData[]>(this.RESERVATIONS_FILE, []);
    let results = rawReservations.map((r) => new Reservation(r));

    const cleanCode = queryCode ? queryCode.trim().toLowerCase() : '';
    const cleanEmail = queryEmail ? queryEmail.trim().toLowerCase() : '';

    if (cleanCode && cleanEmail) {
      results = results.filter((r) => {
        const codeOnly = r.confirmationCode.toLowerCase().replace('res-', '');
        const searchCodeOnly = cleanCode.replace('res-', '');
        const matchesCode =
          r.confirmationCode.toLowerCase().includes(cleanCode) ||
          codeOnly.includes(searchCodeOnly) ||
          searchCodeOnly.includes(codeOnly) ||
          r.id.toLowerCase().includes(cleanCode);
        const matchesEmail = r.guest.email.toLowerCase().includes(cleanEmail);
        return matchesCode || matchesEmail;
      });
    } else if (cleanCode) {
      results = results.filter((r) => {
        const codeOnly = r.confirmationCode.toLowerCase().replace('res-', '');
        const searchCodeOnly = cleanCode.replace('res-', '');
        return (
          r.confirmationCode.toLowerCase().includes(cleanCode) ||
          codeOnly.includes(searchCodeOnly) ||
          searchCodeOnly.includes(codeOnly) ||
          r.id.toLowerCase().includes(cleanCode) ||
          `${r.guest.firstName} ${r.guest.lastName}`.toLowerCase().includes(cleanCode) ||
          r.guest.email.toLowerCase().includes(cleanCode)
        );
      });
    } else if (cleanEmail) {
      results = results.filter((r) => r.guest.email.toLowerCase().includes(cleanEmail));
    }

    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Cancels a reservation using OOP policy calculator and updates File I/O store.
   */
  public static async cancelReservation(reservationId: string) {
    const rawReservations = await FileStorageService.readData<ReservationData[]>(this.RESERVATIONS_FILE, []);
    const index = rawReservations.findIndex((r) => r.id === reservationId || r.confirmationCode === reservationId);

    if (index === -1) {
      throw new Error('Reservation not found.');
    }

    const reservationEntity = new Reservation(rawReservations[index]);
    const cancelResult = reservationEntity.cancel();

    if (!cancelResult.success) {
      throw new Error(cancelResult.policyNotice);
    }

    // Save updated entity to JSON File Store
    rawReservations[index] = reservationEntity;
    await FileStorageService.writeData(this.RESERVATIONS_FILE, rawReservations);

    // Update payment record in File Store
    const rawPayments = await FileStorageService.readData<PaymentDetails[]>(this.PAYMENTS_FILE, []);
    const payIdx = rawPayments.findIndex((p) => p.reservationId === reservationEntity.id);
    if (payIdx !== -1) {
      rawPayments[payIdx].status = 'Refunded';
      await FileStorageService.writeData(this.PAYMENTS_FILE, rawPayments);
    }

    return {
      reservation: reservationEntity,
      policyNotice: cancelResult.policyNotice,
      refundAmount: cancelResult.refundAmount,
    };
  }

  /**
   * Admin stats overview.
   */
  public static async getAdminStats() {
    const rawRooms = await FileStorageService.readData<RoomData[]>(this.ROOMS_FILE, []);
    const rawReservations = await FileStorageService.readData<ReservationData[]>(this.RESERVATIONS_FILE, []);

    const totalRooms = rawRooms.length;
    const activeReservations = rawReservations.filter((r) => r.status === 'Confirmed');
    const cancelledReservations = rawReservations.filter((r) => r.status === 'Cancelled');

    const totalRevenue = activeReservations.reduce((sum, r) => sum + r.pricing.grandTotal, 0);
    const totalNightsBooked = activeReservations.reduce((sum, r) => sum + r.pricing.nights, 0);

    const occupancyRate = Math.min(100, Math.round((activeReservations.length / Math.max(1, totalRooms)) * 100));

    // Category breakdown
    const categoryStats: Record<string, number> = {};
    rawRooms.forEach((room) => {
      categoryStats[room.category] = (categoryStats[room.category] || 0) + 1;
    });

    return {
      totalRooms,
      activeReservationsCount: activeReservations.length,
      cancelledReservationsCount: cancelledReservations.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalNightsBooked,
      occupancyRate,
      categoryStats,
      recentBookings: rawReservations.slice(-5).reverse(),
    };
  }

  /**
   * Permanently deletes a room from inventory.
   */
  public static async deleteRoom(id: string) {
    const rawRooms = await FileStorageService.readData<RoomData[]>(this.ROOMS_FILE, []);
    const filtered = rawRooms.filter((r) => r.id !== id);
    if (filtered.length === rawRooms.length) {
      throw new Error('Room not found.');
    }
    await FileStorageService.writeData(this.ROOMS_FILE, filtered);
    return { success: true };
  }

  /**
   * Permanently deletes a reservation record.
   */
  public static async deleteReservation(id: string) {
    const rawReservations = await FileStorageService.readData<ReservationData[]>(this.RESERVATIONS_FILE, []);
    const filtered = rawReservations.filter((r) => r.id !== id && r.confirmationCode !== id);
    if (filtered.length === rawReservations.length) {
      throw new Error('Reservation not found.');
    }
    await FileStorageService.writeData(this.RESERVATIONS_FILE, filtered);
    return { success: true };
  }

  /**
   * Adds or updates a room in the File Store.
   */
  public static async saveRoom(roomData: Partial<RoomData>) {
    const rawRooms = await FileStorageService.readData<RoomData[]>(this.ROOMS_FILE, []);
    let updatedRoom: RoomData;

    if (roomData.id) {
      const idx = rawRooms.findIndex((r) => r.id === roomData.id);
      if (idx !== -1) {
        rawRooms[idx] = { ...rawRooms[idx], ...roomData } as RoomData;
        updatedRoom = rawRooms[idx];
      } else {
        throw new Error('Room not found for update.');
      }
    } else {
      updatedRoom = {
        id: `room-${Date.now()}`,
        roomNumber: roomData.roomNumber || `${Math.floor(Math.random() * 800) + 100}`,
        category: roomData.category || 'Standard',
        name: roomData.name || 'New Custom Room',
        description: roomData.description || 'Comfortable hotel accommodation.',
        pricePerNight: roomData.pricePerNight || 199,
        maxGuests: roomData.maxGuests || 2,
        sizeSqFt: roomData.sizeSqFt || 400,
        bedType: roomData.bedType || '1 King Bed',
        floor: roomData.floor || 2,
        images: roomData.images || ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'],
        amenities: roomData.amenities || ['Wi-Fi', 'Air Conditioning', 'Smart TV'],
        status: roomData.status || 'Available',
        rating: 4.8,
        reviewsCount: 1,
      };
      rawRooms.push(updatedRoom);
    }

    await FileStorageService.writeData(this.ROOMS_FILE, rawRooms);
    return new Room(updatedRoom);
  }
}
