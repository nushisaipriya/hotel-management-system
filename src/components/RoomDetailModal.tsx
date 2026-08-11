import React from 'react';
import { X, Users, Maximize2, Bed, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';
import { RoomData } from '../types/hotel';

interface RoomDetailModalProps {
  room: RoomData | null;
  onClose: () => void;
  onProceedToBooking: (room: RoomData) => void;
  nights: number;
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  room,
  onClose,
  onProceedToBooking,
  nights,
}) => {
  const [activeImageIdx, setActiveImageIdx] = React.useState(0);

  if (!room) return null;

  const roomTotal = room.pricePerNight * nights;
  const tax = Math.round(roomTotal * 0.12 * 100) / 100;
  const resortFee = nights * 25;
  const cleaningFee = room.category === 'Penthouse' ? 100 : room.category === 'Suite' ? 50 : 25;
  const totalEst = Math.round((roomTotal + tax + resortFee + cleaningFee) * 100) / 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white border-2 border-slate-900 shadow-2xl overflow-hidden text-slate-900 my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-indigo-600 font-bold block mb-0.5">
              {room.category} Accommodation
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {room.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 border border-slate-200 hover:border-slate-900 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Photos */}
          <div className="space-y-3">
            <div className="relative aspect-[16/9] bg-slate-100 border border-slate-200 overflow-hidden">
              <img
                src={room.images[activeImageIdx] || room.images[0]}
                alt={room.name}
                className="w-full h-full object-cover"
              />
            </div>
            {room.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {room.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-20 h-14 overflow-hidden border transition-all flex-shrink-0 ${
                      activeImageIdx === idx ? 'border-slate-900 border-2' : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Specs Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Room Number</span>
              <span className="font-mono font-bold text-slate-900">Room {room.roomNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Max Guests</span>
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-indigo-600" /> {room.maxGuests} Guests
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Bed Type</span>
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <Bed className="w-3.5 h-3.5 text-indigo-600" /> {room.bedType}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Room Size</span>
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5 text-indigo-600" /> {room.sizeSqFt} sq ft
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-2">Room Overview</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{room.description}</p>
          </div>

          {/* Amenities */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-3">Included Amenities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {room.amenities.map((amenity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Estimation Breakdown */}
          <div className="p-4 bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">
              Live Rate Calculation
            </h4>
            <div className="space-y-1.5 text-xs text-slate-600 font-mono">
              <div className="flex justify-between">
                <span>Room Rate (${room.pricePerNight} x {nights} nights):</span>
                <span>${roomTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Occupancy Tax (12%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Resort Fee ($25 x {nights} nights):</span>
                <span>${resortFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cleaning Fee:</span>
                <span>${cleaningFee.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900 font-sans">
                <span>Total Payable:</span>
                <span className="text-indigo-600 font-mono text-base font-bold">${totalEst.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="flex items-start gap-2.5 p-3.5 bg-indigo-50 border border-indigo-200 text-xs text-indigo-900">
            <ShieldAlert className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">100% Flexible Cancellation</span>
              <span>Cancel up to 24 hours prior to check-in with automatic instant refund processing.</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-4 sticky bottom-0 z-10">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Estimated Total</span>
            <span className="text-2xl font-mono font-bold text-indigo-600">${totalEst.toFixed(2)}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-300 hover:border-slate-900 text-slate-700 font-bold uppercase tracking-wider text-xs transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => onProceedToBooking(room)}
              className="px-6 py-2.5 bg-slate-900 text-white font-bold uppercase tracking-[0.15em] text-xs hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <span>Book Room</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

