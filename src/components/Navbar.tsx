import React from 'react';
import { Search, CalendarCheck, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  activeTab: 'search' | 'my-bookings' | 'admin';
  setActiveTab: (tab: 'search' | 'my-bookings' | 'admin') => void;
  openInspector: () => void;
  hotelName?: string;
  activeBookingsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openInspector,
  hotelName = 'The Meridian Grand',
  activeBookingsCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-slate-200 text-slate-900">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-8 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div
          onClick={() => setActiveTab('search')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-8 h-8 bg-slate-900 flex items-center justify-center transition-transform group-hover:scale-105">
            <div className="w-4 h-4 border-2 border-white rotate-45"></div>
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight uppercase text-slate-900 group-hover:text-indigo-600 transition-colors">
            {hotelName}
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium uppercase tracking-widest">
          <button
            onClick={() => setActiveTab('search')}
            className={`pb-1 transition-colors flex items-center gap-1.5 ${
              activeTab === 'search'
                ? 'border-b-2 border-slate-900 text-slate-900 font-bold'
                : 'text-slate-400 hover:text-slate-900'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Reservations
          </button>

          <button
            onClick={() => setActiveTab('my-bookings')}
            className={`pb-1 transition-colors flex items-center gap-1.5 relative ${
              activeTab === 'my-bookings'
                ? 'border-b-2 border-slate-900 text-slate-900 font-bold'
                : 'text-slate-400 hover:text-slate-900'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            My Bookings
            {activeBookingsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] font-mono font-bold bg-indigo-600 text-white rounded-none">
                {activeBookingsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`pb-1 transition-colors flex items-center gap-1.5 ${
              activeTab === 'admin'
                ? 'border-b-2 border-slate-900 text-slate-900 font-bold'
                : 'text-slate-400 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Console
          </button>
        </nav>

        {/* Empty placeholder / Actions */}
        <div className="hidden md:block"></div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden flex items-center justify-around py-2 bg-slate-900 text-white text-[10px] uppercase tracking-wider font-semibold border-t border-slate-800">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex items-center gap-1.5 p-1.5 ${
            activeTab === 'search' ? 'text-white font-bold border-b-2 border-white' : 'text-slate-400'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          Search
        </button>
        <button
          onClick={() => setActiveTab('my-bookings')}
          className={`flex items-center gap-1.5 p-1.5 ${
            activeTab === 'my-bookings' ? 'text-white font-bold border-b-2 border-white' : 'text-slate-400'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          Bookings
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`flex items-center gap-1.5 p-1.5 ${
            activeTab === 'admin' ? 'text-white font-bold border-b-2 border-white' : 'text-slate-400'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Admin
        </button>
      </div>
    </header>
  );
};

