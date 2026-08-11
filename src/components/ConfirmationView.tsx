import React from 'react';
import { CheckCircle2, MapPin, Printer, User, Phone, Mail, ArrowRight } from 'lucide-react';
import { ReservationData } from '../types/hotel';

interface ConfirmationViewProps {
  reservation: ReservationData;
  onGoToBookings: () => void;
  onClose: () => void;
}

export const ConfirmationView: React.FC<ConfirmationViewProps> = ({
  reservation,
  onGoToBookings,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-slate-900 max-w-xl mx-auto">
      {/* Header Banner */}
      <div className="text-center space-y-2 p-6 bg-slate-900 text-white border border-slate-900">
        <div className="w-12 h-12 bg-white text-slate-900 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Booking Confirmed
        </h2>
        <p className="text-slate-300 text-xs">
          Your reservation is recorded in the local JSON database file store.
        </p>
        <div className="pt-2">
          <span className="inline-block px-4 py-1 bg-white text-slate-900 font-mono font-bold text-base tracking-widest border border-slate-200">
            {reservation.confirmationCode}
          </span>
        </div>
      </div>

      {/* Reservation Details Card */}
      <div className="p-6 bg-white border border-slate-200 space-y-5">
        {/* Room Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
          <img
            src={reservation.roomSummary.image}
            alt={reservation.roomSummary.name}
            className="w-16 h-16 object-cover border border-slate-200"
          />
          <div>
            <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-widest block">
              Room {reservation.roomSummary.roomNumber} • {reservation.roomSummary.category}
            </span>
            <h3 className="text-base font-bold text-slate-900">
              {reservation.roomSummary.name}
            </h3>
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>777 Oceanfront Blvd, Grand Harbour, CA</span>
            </div>
          </div>
        </div>

        {/* Dates & Guests */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs p-4 bg-slate-50 border border-slate-200 font-mono">
          <div>
            <span className="text-slate-400 text-[10px] uppercase block">Check-In</span>
            <span className="text-slate-900 font-bold block">{reservation.checkInDate}</span>
            <span className="text-[10px] text-slate-500">After 3:00 PM</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase block">Check-Out</span>
            <span className="text-slate-900 font-bold block">{reservation.checkOutDate}</span>
            <span className="text-[10px] text-slate-500">Before 11:00 AM</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase block">Duration</span>
            <span className="text-slate-900 font-bold block">
              {reservation.pricing.nights} Night(s)
            </span>
          </div>
        </div>

        {/* Guest Details */}
        <div className="space-y-2 text-xs">
          <h4 className="font-bold text-slate-900 text-[10px] uppercase tracking-widest">Guest Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>{reservation.guest.firstName} {reservation.guest.lastName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-indigo-600" />
              <span>{reservation.guest.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-indigo-600" />
              <span>{reservation.guest.phone}</span>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="pt-4 border-t border-slate-200 space-y-1.5 text-xs font-mono">
          <div className="flex justify-between text-slate-600">
            <span>Room Stay Rate:</span>
            <span>${reservation.pricing.roomTotal.toFixed(2)}</span>
          </div>
          {reservation.pricing.selectedAddons && reservation.pricing.selectedAddons.length > 0 && (
            <div className="space-y-1 py-1 border-y border-dashed border-slate-200 my-1">
              <span className="text-[10px] text-indigo-600 font-bold uppercase block">Selected Room Enhancements:</span>
              {reservation.pricing.selectedAddons.map((addon, idx) => (
                <div key={idx} className="flex justify-between text-slate-700 text-[11px] pl-2">
                  <span>• {addon.name}</span>
                  <span>+${addon.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>Taxes & Resort Fees:</span>
            <span>${(reservation.pricing.taxAmount + reservation.pricing.resortFee + reservation.pricing.cleaningFee).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-900 font-bold text-sm font-sans pt-2 border-t border-slate-200">
            <span>Total Paid ({reservation.payment.method}):</span>
            <span className="text-indigo-600 font-mono text-base">${reservation.pricing.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          onClick={handlePrint}
          className="w-full sm:w-auto px-5 py-3 border border-slate-300 hover:border-slate-900 text-slate-900 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print Voucher</span>
        </button>

        <button
          onClick={onGoToBookings}
          className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white text-xs font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
        >
          <span>My Bookings</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

