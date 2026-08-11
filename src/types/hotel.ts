export type RoomCategory = 'Standard' | 'Deluxe' | 'Suite' | 'Executive' | 'Penthouse';

export type RoomStatus = 'Available' | 'Occupied' | 'Maintenance';

export type ReservationStatus = 'Confirmed' | 'Cancelled' | 'Completed';

export type PaymentMethod = 'CreditCard' | 'DigitalWallet' | 'PayAtHotel';

export type PaymentStatus = 'Pending' | 'Success' | 'Failed' | 'Refunded';

export interface Amenity {
  id: string;
  name: string;
  icon: string;
}

export interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  membershipTier?: 'Standard' | 'VIP' | 'Elite';
  specialRequests?: string;
}

export interface PaymentDetails {
  id: string;
  reservationId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId: string;
  timestamp: string;
  cardLast4?: string;
  cardBrand?: string;
}

export interface RoomOptionAddon {
  id: string;
  name: string;
  description: string;
  price: number;
  perNight?: boolean;
}

export interface PriceBreakdown {
  pricePerNight: number;
  nights: number;
  roomTotal: number;
  taxAmount: number; // e.g. 12%
  resortFee: number; // e.g. $25/night
  cleaningFee: number;
  addonsTotal?: number;
  selectedAddons?: { id: string; name: string; price: number }[];
  discount: number;
  grandTotal: number;
}

export interface RoomData {
  id: string;
  roomNumber: string;
  category: RoomCategory;
  name: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  sizeSqFt: number;
  bedType: string;
  floor: number;
  images: string[];
  amenities: string[];
  status: RoomStatus;
  rating: number;
  reviewsCount: number;
}

export interface ReservationData {
  id: string;
  confirmationCode: string;
  roomId: string;
  roomSummary: {
    name: string;
    category: RoomCategory;
    roomNumber: string;
    image: string;
  };
  guest: GuestInfo;
  checkInDate: string;  // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  guestsCount: number;
  pricing: PriceBreakdown;
  payment: PaymentDetails;
  status: ReservationStatus;
  cancelledAt?: string;
  refundAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface HotelInfo {
  id: string;
  name: string;
  tagline: string;
  address: string;
  city: string;
  country: string;
  rating: number;
  totalReviews: number;
  phone: string;
  email: string;
  checkInTime: string;
  checkOutTime: string;
  description: string;
  policies: string[];
  heroImage: string;
}

export interface AvailabilitySearchQuery {
  keyword?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  category?: RoomCategory | 'All';
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'size';
}
