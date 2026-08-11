import React from 'react';
import { Star, Users, Maximize2, Bed, ArrowRight } from 'lucide-react';
import { RoomData } from '../types/hotel';

interface RoomCardProps {
  room: RoomData;
  nights: number;
  onSelect: (room: RoomData) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, nights, onSelect }) => {
  const getCategoryTierLabel = (category: string) => {
    switch (category) {
      case 'Penthouse':
        return 'Ultra Lux';
      case 'Executive':
        return 'Executive';
      case 'Suite':
        return 'Premium';
      case 'Deluxe':
        return 'Signature';
      default:
        return 'Essential';
    }
  };

  const estimatedTotal = room.pricePerNight * nights;

  return (
    <div className="group relative bg-white border border-slate-200 hover:border-slate-900 p-5 flex flex-col h-full transition-all duration-200 shadow-sm hover:shadow-md">
      {/* Image Thumbnail with Overlay Badges */}
      <div className="h-44 bg-slate-100 mb-4 relative overflow-hidden border border-slate-100">
        <img
          src={room.images[0] || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Room Number */}
        <div className="absolute top-2 left-2 bg-slate-900 text-white font-mono text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
          Room {room.roomNumber}
        </div>

        {/* Rating */}
        <div className="absolute top-2 right-2 bg-white/90 border border-slate-200 text-slate-900 px-2 py-0.5 text-[10px] font-mono font-bold flex items-center gap-1">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>{room.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Category Tag */}
      <span className="text-[10px] uppercase tracking-[0.2em] text-indigo-600 font-bold mb-1">
        {getCategoryTierLabel(room.category)} • {room.category}
      </span>

      {/* Title */}
      <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
        {room.name}
      </h3>

      {/* Description */}
      <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">
        {room.description}
      </p>

      {/* Key Features Bullet List */}
      <ul className="text-xs space-y-1.5 text-slate-600 mb-6 mt-auto font-sans">
        <li className="flex items-center gap-1.5">
          <span className="text-indigo-600">•</span>
          <span>{room.maxGuests} Guests Max ({room.bedType})</span>
        </li>
        <li className="flex items-center gap-1.5">
          <span className="text-indigo-600">•</span>
          <span>{room.sizeSqFt} sq ft • Floor {room.floor}</span>
        </li>
        <li className="flex items-center gap-1.5">
          <span className="text-indigo-600">•</span>
          <span className="truncate">{room.amenities.slice(0, 2).join(', ')}</span>
        </li>
      </ul>

      {/* Footer & Price */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          <div className="text-lg font-mono font-bold text-slate-900">
            ${room.pricePerNight}<span className="text-xs opacity-50 font-sans font-normal">/nt</span>
          </div>
          {nights > 1 && (
            <div className="text-[10px] text-slate-400 font-mono">
              Est. ${estimatedTotal} ({nights} nights)
            </div>
          )}
        </div>

        <button
          onClick={() => onSelect(room)}
          className="px-4 py-2 border border-slate-900 text-xs font-bold uppercase tracking-widest text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors flex items-center gap-1"
        >
          <span>Select</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

