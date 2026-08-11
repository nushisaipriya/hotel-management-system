import React from 'react';
import { X, User, ArrowLeft } from 'lucide-react';
import { RoomData, PaymentMethod, ReservationData } from '../types/hotel';
import { PaymentForm } from './PaymentForm';
import { ConfirmationView } from './ConfirmationView';

interface BookingModalProps {
  room: RoomData | null;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  onClose: () => void;
  onBookingSuccess: (reservation: ReservationData) => void;
  onGoToBookings: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  room,
  checkInDate,
  checkOutDate,
  guestsCount,
  onClose,
  onBookingSuccess,
  onGoToBookings,
}) => {
  const [step, setStep] = React.useState<1 | 2 | 3>(1); // 1: Guest Info, 2: Payment, 3: Confirmation
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>('CreditCard');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [completedReservation, setCompletedReservation] = React.useState<ReservationData | null>(null);

  // Guest Details Form State
  const [guest, setGuest] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    membershipTier: 'Standard' as 'Standard' | 'VIP' | 'Elite',
    specialRequests: '',
  });

  // Payment Form State
  const [cardDetails, setCardDetails] = React.useState({
    number: '',
    exp: '',
    cvc: '',
    name: '',
  });

  // Selected Room Option Add-ons State
  const [selectedAddons, setSelectedAddons] = React.useState<string[]>([]);

  if (!room) return null;

  // Addon definitions
  const AVAILABLE_ADDONS = [
    { id: 'breakfast', name: 'Daily Gourmet Breakfast', description: 'Fresh hot buffet & barista coffee', price: 25, perNight: true },
    { id: 'spaPass', name: 'Thermal Spa & Hydrotherapy Pass', description: 'Unlimited sauna & thermal bath access', price: 40, perNight: true },
    { id: 'airportShuttle', name: 'Private Airport Chauffeur', description: 'Roundtrip luxury sedan transfer', price: 60, perNight: false },
    { id: 'lateCheckout', name: 'Guaranteed Late Check-out', description: 'Extend stay until 4:00 PM on departure', price: 45, perNight: false },
    { id: 'welcomeChampagne', name: 'Champagne & Tropical Fruit Basket', description: 'Chilled bottle waiting upon check-in', price: 65, perNight: false },
  ];

  // Pricing calculations
  const start = new Date(checkInDate).getTime();
  const end = new Date(checkOutDate).getTime();
  const nights = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));

  const roomTotal = room.pricePerNight * nights;

  // Calculate selected add-ons cost
  const selectedAddonsList = AVAILABLE_ADDONS.filter((a) => selectedAddons.includes(a.id));
  const addonsTotal = selectedAddonsList.reduce((sum, addon) => {
    return sum + (addon.perNight ? addon.price * nights * Math.max(1, guestsCount) : addon.price);
  }, 0);

  let discountPercent = 0;
  if (guest.membershipTier === 'VIP') discountPercent = 10;
  if (guest.membershipTier === 'Elite') discountPercent = 15;

  const discountAmount = (roomTotal * discountPercent) / 100;
  const discountedTotal = roomTotal - discountAmount;
  const tax = Math.round((discountedTotal + addonsTotal) * 0.12 * 100) / 100;
  const resortFee = nights * 25;
  const cleaningFee = room.category === 'Penthouse' ? 100 : room.category === 'Suite' ? 50 : 25;
  const grandTotal = Math.round((discountedTotal + addonsTotal + tax + resortFee + cleaningFee) * 100) / 100;

  const handleGuestInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guest.firstName || !guest.lastName || !guest.email || !guest.phone) {
      setErrorMessage('Please fill in all required guest information fields.');
      return;
    }
    setErrorMessage('');
    setStep(2);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage('');

    const payloadCardDetails =
      paymentMethod === 'CreditCard'
        ? {
            name: cardDetails.name || `${guest.firstName} ${guest.lastName}` || 'Valued Guest',
            number: cardDetails.number || '4242 4242 4242 4242',
            exp: cardDetails.exp || '12/28',
            cvc: cardDetails.cvc || '123',
          }
        : cardDetails;

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: room.id,
          checkInDate,
          checkOutDate,
          guestsCount,
          guest,
          paymentMethod,
          cardDetails: payloadCardDetails,
          selectedAddons: selectedAddonsList.map((a) => ({
            id: a.id,
            name: a.name,
            price: a.perNight ? a.price * nights * Math.max(1, guestsCount) : a.price,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Booking failed.');
      }

      setCompletedReservation(data.reservation);
      onBookingSuccess(data.reservation);
      setStep(3);
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment simulation failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border-2 border-slate-900 shadow-2xl overflow-hidden text-slate-900 my-8 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="p-1 border border-slate-300 text-slate-700 hover:border-slate-900"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-widest block">
                {step === 1 ? 'Step 1: Guest Information' : step === 2 ? 'Step 2: Payment Simulation' : 'Confirmation'}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {step === 3 ? 'Reservation Confirmed' : `Booking ${room.name}`}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 border border-slate-200 hover:border-slate-900 text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {step !== 3 && (
            /* Stay Summary Strip */
            <div className="p-4 bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
              <div className="flex items-center gap-3">
                <img
                  src={room.images[0]}
                  alt={room.name}
                  className="w-12 h-12 object-cover border border-slate-200"
                />
                <div>
                  <div className="font-bold text-slate-900 font-sans">{room.name}</div>
                  <div className="text-slate-500">Room {room.roomNumber} • {room.category}</div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-slate-700">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Dates</span>
                  <span className="text-slate-900 font-bold">{checkInDate} to {checkOutDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Total</span>
                  <span className="text-indigo-600 font-bold text-sm">${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Guest Information */}
          {step === 1 && (
            <form onSubmit={handleGuestInfoSubmit} className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                Primary Guest Information
              </h3>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-mono">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah"
                    value={guest.firstName}
                    onChange={(e) => setGuest({ ...guest, firstName: e.target.value })}
                    className="w-full bg-white border border-slate-300 px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jenkins"
                    value={guest.lastName}
                    onChange={(e) => setGuest({ ...guest, lastName: e.target.value })}
                    className="w-full bg-white border border-slate-300 px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="sarah.j@example.com"
                    value={guest.email}
                    onChange={(e) => setGuest({ ...guest, email: e.target.value })}
                    className="w-full bg-white border border-slate-300 px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 234-5678"
                    value={guest.phone}
                    onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
                    className="w-full bg-white border border-slate-300 px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              {/* Loyalty Tier */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex justify-between">
                  <span>Loyalty Membership Status</span>
                  {discountAmount > 0 && (
                    <span className="text-indigo-600 font-mono font-bold">
                      {guest.membershipTier} Discount: -${discountAmount.toFixed(2)}
                    </span>
                  )}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Standard', 'VIP', 'Elite'] as const).map((tier) => (
                    <button
                      type="button"
                      key={tier}
                      onClick={() => setGuest({ ...guest, membershipTier: tier })}
                      className={`p-2.5 border text-xs font-bold uppercase tracking-wider transition-colors flex flex-col items-center gap-0.5 ${
                        guest.membershipTier === tier
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <span>{tier}</span>
                      <span className="text-[9px] opacity-70 font-mono font-normal">
                        {tier === 'Standard' ? 'Standard Rate' : tier === 'VIP' ? '10% Off' : '15% Off'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Room Enhancement Options & Add-ons */}
              <div className="space-y-2 border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold text-slate-900 uppercase tracking-widest">
                    Optional Room Enhancements & Packages
                  </label>
                  {addonsTotal > 0 && (
                    <span className="text-xs font-bold font-mono text-emerald-700">
                      +${addonsTotal.toFixed(2)} Add-ons Total
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {AVAILABLE_ADDONS.map((addon) => {
                    const isSelected = selectedAddons.includes(addon.id);
                    const calcCost = addon.perNight ? addon.price * nights * Math.max(1, guestsCount) : addon.price;

                    return (
                      <div
                        key={addon.id}
                        onClick={() => {
                          setSelectedAddons((prev) =>
                            isSelected ? prev.filter((id) => id !== addon.id) : [...prev, addon.id]
                          );
                        }}
                        className={`p-3 border transition-colors cursor-pointer flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-indigo-50/60 border-indigo-600'
                            : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // handled by parent div click
                          className="mt-0.5 accent-slate-900"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-900 truncate">{addon.name}</span>
                            <span className="text-[11px] font-mono font-bold text-slate-700 flex-shrink-0">
                              +${calcCost}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-1">{addon.description}</p>
                          <span className="text-[9px] text-slate-400 font-mono">
                            {addon.perNight ? `$${addon.price}/night per guest` : 'Flat fee'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Special Requests (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Late check-in, high floor, quiet room..."
                  value={guest.specialRequests}
                  onChange={(e) => setGuest({ ...guest, specialRequests: e.target.value })}
                  className="w-full bg-white border border-slate-300 p-2.5 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="bg-slate-900 text-white font-bold py-3 px-6 text-xs uppercase tracking-[0.15em] hover:bg-slate-800 transition-colors"
                >
                  Proceed to Payment
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Payment Simulation */}
          {step === 2 && (
            <PaymentForm
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              cardDetails={cardDetails}
              setCardDetails={setCardDetails}
              amount={grandTotal}
              isProcessing={isProcessing}
              onSubmit={handlePaymentSubmit}
              errorMessage={errorMessage}
            />
          )}

          {/* STEP 3: Confirmation View */}
          {step === 3 && completedReservation && (
            <ConfirmationView
              reservation={completedReservation}
              onGoToBookings={onGoToBookings}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

