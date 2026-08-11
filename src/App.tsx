/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Navbar } from './components/Navbar';
import { HeroSearch } from './components/HeroSearch';
import { RoomCard } from './components/RoomCard';
import { RoomDetailModal } from './components/RoomDetailModal';
import { BookingModal } from './components/BookingModal';
import { MyBookings } from './components/MyBookings';
import { AdminDashboard } from './components/AdminDashboard';
import { OopInspectorModal } from './components/OopInspectorModal';
import { RoomData, HotelInfo, RoomCategory, AvailabilitySearchQuery, ReservationData } from './types/hotel';
import { Star } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = React.useState<'search' | 'my-bookings' | 'admin'>('search');
  const [hotel, setHotel] = React.useState<HotelInfo | null>(null);
  const [rooms, setRooms] = React.useState<RoomData[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = React.useState(true);
  const [activeBookingsCount, setActiveBookingsCount] = React.useState(0);

  // Default dates: check-in = tomorrow, check-out = 3 days later
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultCheckIn = tomorrow.toISOString().split('T')[0];

  const threeDaysLater = new Date();
  threeDaysLater.setDate(threeDaysLater.getDate() + 4);
  const defaultCheckOut = threeDaysLater.toISOString().split('T')[0];

  const [searchQuery, setSearchQuery] = React.useState<AvailabilitySearchQuery>({
    checkIn: defaultCheckIn,
    checkOut: defaultCheckOut,
    guests: 2,
    category: 'All',
    sortBy: 'rating',
    amenities: [],
  });

  // Modal states
  const [detailModalRoom, setDetailModalRoom] = React.useState<RoomData | null>(null);
  const [bookingModalRoom, setBookingModalRoom] = React.useState<RoomData | null>(null);
  const [showInspector, setShowInspector] = React.useState(false);

  // Calculate nights
  const start = searchQuery.checkIn ? new Date(searchQuery.checkIn).getTime() : 0;
  const end = searchQuery.checkOut ? new Date(searchQuery.checkOut).getTime() : 0;
  const nights = start && end && end > start ? Math.round((end - start) / (1000 * 60 * 60 * 24)) : 3;

  // Fetch hotel info and initial room list
  const fetchHotelAndRooms = React.useCallback(async () => {
    setIsLoadingRooms(true);
    try {
      // Hotel details
      const hotelRes = await fetch('/api/hotel');
      if (hotelRes.ok) {
        const hotelData = await hotelRes.json();
        setHotel(hotelData);
      }

      // Rooms search
      const params = new URLSearchParams();
      if (searchQuery.keyword) params.append('keyword', searchQuery.keyword);
      if (searchQuery.checkIn) params.append('checkIn', searchQuery.checkIn);
      if (searchQuery.checkOut) params.append('checkOut', searchQuery.checkOut);
      if (searchQuery.guests) params.append('guests', searchQuery.guests.toString());
      if (searchQuery.category && searchQuery.category !== 'All') params.append('category', searchQuery.category);
      if (searchQuery.minPrice) params.append('minPrice', searchQuery.minPrice.toString());
      if (searchQuery.maxPrice) params.append('maxPrice', searchQuery.maxPrice.toString());
      if (searchQuery.sortBy) params.append('sortBy', searchQuery.sortBy);
      if (searchQuery.amenities && searchQuery.amenities.length > 0) {
        params.append('amenities', searchQuery.amenities.join(','));
      }

      const roomsRes = await fetch(`/api/rooms?${params.toString()}`);
      if (roomsRes.ok) {
        const roomsData = await roomsRes.json();
        setRooms(roomsData);
      }

      // Count active bookings for badge
      const resCountRes = await fetch('/api/reservations');
      if (resCountRes.ok) {
        const resList = await resCountRes.json();
        const activeCount = resList.filter((r: any) => r.status === 'Confirmed').length;
        setActiveBookingsCount(activeCount);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoadingRooms(false);
    }
  }, [searchQuery]);

  React.useEffect(() => {
    fetchHotelAndRooms();
  }, [fetchHotelAndRooms]);

  const categories: (RoomCategory | 'All')[] = ['All', 'Standard', 'Deluxe', 'Suite', 'Executive', 'Penthouse'];

  const availableAmenities = [
    'Wi-Fi',
    'Ocean View',
    'Private Balcony',
    'Rainfall Shower',
    'King Bed',
    'Private Jacuzzi',
    'Executive Lounge Access',
    'Breakfast Included',
    'Private Terrace Plunge Pool',
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openInspector={() => setShowInspector(true)}
        hotelName={hotel?.name}
        activeBookingsCount={activeBookingsCount}
      />

      {/* Tab View Switcher */}
      <main className="flex-1">
        {activeTab === 'search' && (
          <div className="space-y-12 pb-20">
            {/* Hero Banner & Search Filter Control */}
            <HeroSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              categories={categories}
              onSearch={fetchHotelAndRooms}
              availableAmenities={availableAmenities}
            />

            {/* Room Search Results Grid */}
            <div id="rooms-results" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100">
                    Available Accommodations
                  </h2>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1">
                    Showing available rooms for stay duration of{' '}
                    <span className="text-amber-400 font-bold">{nights} night(s)</span> ({searchQuery.checkIn} to {searchQuery.checkOut})
                  </p>
                </div>

                <div className="text-xs text-slate-400 font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                  {rooms.length} Room(s) Available
                </div>
              </div>

              {/* Loading State */}
              {isLoadingRooms ? (
                <div className="py-20 text-center space-y-3">
                  <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-slate-400 font-mono text-xs">Checking real-time date availability & database records...</p>
                </div>
              ) : rooms.length === 0 ? (
                /* No Results State */
                <div className="py-20 text-center bg-slate-900/40 rounded-3xl border border-slate-800/80 p-8 space-y-4 max-w-xl mx-auto">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
                    <Star className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-slate-200">No Rooms Found for These Filters</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Some rooms may be booked for the selected date range. Try adjusting your check-in/check-out dates or resetting category filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery({
                        checkIn: defaultCheckIn,
                        checkOut: defaultCheckOut,
                        guests: 2,
                        category: 'All',
                        sortBy: 'rating',
                        amenities: [],
                      });
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs border border-slate-700"
                  >
                    Reset Search Filters
                  </button>
                </div>
              ) : (
                /* Cards Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rooms.map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      nights={nights}
                      onSelect={(selected) => setDetailModalRoom(selected)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: My Bookings */}
        {activeTab === 'my-bookings' && (
          <MyBookings onCancelSuccess={fetchHotelAndRooms} />
        )}

        {/* Tab 3: Admin Management */}
        {activeTab === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* Modals */}

      {/* Room Detail Modal */}
      {detailModalRoom && (
        <RoomDetailModal
          room={detailModalRoom}
          nights={nights}
          onClose={() => setDetailModalRoom(null)}
          onProceedToBooking={(roomToBook) => {
            setDetailModalRoom(null);
            setBookingModalRoom(roomToBook);
          }}
        />
      )}

      {/* Multi-Step Booking & Payment Modal */}
      {bookingModalRoom && (
        <BookingModal
          room={bookingModalRoom}
          checkInDate={searchQuery.checkIn || defaultCheckIn}
          checkOutDate={searchQuery.checkOut || defaultCheckOut}
          guestsCount={searchQuery.guests || 2}
          onClose={() => setBookingModalRoom(null)}
          onBookingSuccess={() => {
            fetchHotelAndRooms();
          }}
          onGoToBookings={() => {
            setBookingModalRoom(null);
            setActiveTab('my-bookings');
          }}
        />
      )}

      {/* OOP & File Storage Inspector Modal */}
      {showInspector && (
        <OopInspectorModal onClose={() => setShowInspector(false)} />
      )}

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">{hotel?.name || 'The Meridian Grand'}</span>
            <span>• Luxury Hotel & Suites</span>
          </div>

          <div className="text-slate-500 font-mono text-xs">
            © {new Date().getFullYear()} {hotel?.name || 'The Meridian Grand'}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
