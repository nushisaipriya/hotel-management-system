import React from 'react';
import { Search, Calendar, Users, SlidersHorizontal, Layers, Check, X, RotateCcw } from 'lucide-react';
import { RoomCategory, AvailabilitySearchQuery } from '../types/hotel';

interface HeroSearchProps {
  searchQuery: AvailabilitySearchQuery;
  setSearchQuery: React.Dispatch<React.SetStateAction<AvailabilitySearchQuery>>;
  categories: (RoomCategory | 'All')[];
  onSearch: () => void;
  availableAmenities: string[];
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  searchQuery,
  setSearchQuery,
  categories,
  onSearch,
  availableAmenities,
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const handleCategorySelect = (cat: RoomCategory | 'All') => {
    setSearchQuery((prev) => ({ ...prev, category: cat }));
  };

  const handleCheckInChange = (newCheckIn: string) => {
    setSearchQuery((prev) => {
      let newCheckOut = prev.checkOut;
      if (newCheckIn && prev.checkOut && new Date(newCheckIn) >= new Date(prev.checkOut)) {
        const nextDay = new Date(newCheckIn);
        nextDay.setDate(nextDay.getDate() + 1);
        newCheckOut = nextDay.toISOString().split('T')[0];
      }
      return { ...prev, checkIn: newCheckIn, checkOut: newCheckOut };
    });
  };

  const handleCheckOutChange = (newCheckOut: string) => {
    setSearchQuery((prev) => {
      let newCheckIn = prev.checkIn;
      if (newCheckOut && prev.checkIn && new Date(newCheckOut) <= new Date(prev.checkIn)) {
        const prevDay = new Date(newCheckOut);
        prevDay.setDate(prevDay.getDate() - 1);
        newCheckIn = prevDay.toISOString().split('T')[0];
      }
      return { ...prev, checkIn: newCheckIn, checkOut: newCheckOut };
    });
  };

  const toggleAmenity = (amenity: string) => {
    setSearchQuery((prev) => {
      const current = prev.amenities || [];
      const updated = current.includes(amenity)
        ? current.filter((a) => a !== amenity)
        : [...current, amenity];
      return { ...prev, amenities: updated };
    });
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearch();
    const resultsElement = document.getElementById('rooms-results');
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const hasActiveFilters = Boolean(
    searchQuery.keyword ||
    (searchQuery.category && searchQuery.category !== 'All') ||
    (searchQuery.amenities && searchQuery.amenities.length > 0) ||
    (searchQuery.maxPrice && searchQuery.maxPrice < 1000)
  );

  return (
    <section className="p-6 sm:p-8 bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-bold mb-1">
              Search & Reserve
            </div>
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
              Explore Available <span className="font-bold">Accommodations</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-md">
            Filter by dates, room features, or keywords. Real-time availability checks ensure instant confirmation.
          </p>
        </div>

        {/* Main Search Filter Form */}
        <form onSubmit={handleSearchSubmit} className="bg-slate-900 border border-slate-700/80 p-4 sm:p-6 space-y-4">
          {/* Row 1: Keyword Text Search Bar */}
          <div>
            <label className="text-[10px] uppercase tracking-widest opacity-60 font-semibold block mb-1">
              Search Keyword or Feature
            </label>
            <div className="bg-white/10 border border-white/20 p-2.5 flex items-center gap-2">
              <Search className="w-4 h-4 opacity-40 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search by room name, bed type, view, e.g. 'Ocean', 'Balcony', 'King'..."
                value={searchQuery.keyword || ''}
                onChange={(e) => setSearchQuery((prev) => ({ ...prev, keyword: e.target.value }))}
                className="bg-transparent text-xs text-white placeholder-slate-400 w-full focus:outline-none"
              />
              {searchQuery.keyword && (
                <button
                  type="button"
                  onClick={() => setSearchQuery((prev) => ({ ...prev, keyword: '' }))}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Dates, Guests, Sort & Search Button */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Check-In Date */}
            <div className="md:col-span-3 space-y-1">
              <label className="text-[10px] uppercase tracking-widest opacity-60 font-semibold block">
                Check-In Date
              </label>
              <div className="bg-white/10 border border-white/20 p-2.5 flex items-center gap-2">
                <Calendar className="w-4 h-4 opacity-40 flex-shrink-0" />
                <input
                  type="date"
                  value={searchQuery.checkIn || ''}
                  onChange={(e) => handleCheckInChange(e.target.value)}
                  className="bg-transparent text-xs text-white w-full focus:outline-none"
                />
              </div>
            </div>

            {/* Check-Out Date */}
            <div className="md:col-span-3 space-y-1">
              <label className="text-[10px] uppercase tracking-widest opacity-60 font-semibold block">
                Check-Out Date
              </label>
              <div className="bg-white/10 border border-white/20 p-2.5 flex items-center gap-2">
                <Calendar className="w-4 h-4 opacity-40 flex-shrink-0" />
                <input
                  type="date"
                  value={searchQuery.checkOut || ''}
                  onChange={(e) => handleCheckOutChange(e.target.value)}
                  className="bg-transparent text-xs text-white w-full focus:outline-none"
                />
              </div>
            </div>

            {/* Guests */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] uppercase tracking-widest opacity-60 font-semibold block">
                Guests
              </label>
              <div className="bg-white/10 border border-white/20 p-2.5 flex items-center gap-2">
                <Users className="w-4 h-4 opacity-40 flex-shrink-0" />
                <select
                  value={searchQuery.guests || 1}
                  onChange={(e) => setSearchQuery((prev) => ({ ...prev, guests: Number(e.target.value) }))}
                  className="bg-transparent text-xs text-white w-full focus:outline-none [&>option]:bg-slate-900 [&>option]:text-white"
                >
                  <option value={1}>1 Guest</option>
                  <option value={2}>2 Guests</option>
                  <option value={3}>3 Guests</option>
                  <option value={4}>4 Guests</option>
                  <option value={5}>5+ Guests</option>
                </select>
              </div>
            </div>

            {/* Sort */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] uppercase tracking-widest opacity-60 font-semibold block">
                Sort By
              </label>
              <div className="bg-white/10 border border-white/20 p-2.5 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 opacity-40 flex-shrink-0" />
                <select
                  value={searchQuery.sortBy || 'rating'}
                  onChange={(e) => setSearchQuery((prev) => ({ ...prev, sortBy: e.target.value as any }))}
                  className="bg-transparent text-xs text-white w-full focus:outline-none [&>option]:bg-slate-900 [&>option]:text-white"
                >
                  <option value="rating">Top Rated</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="size">Size</option>
                </select>
              </div>
            </div>

            {/* Search Button */}
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-white text-slate-900 py-3 px-6 font-bold uppercase tracking-wider text-xs hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                Search
              </button>
            </div>
          </div>

          {/* Categories Bar */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-2 flex items-center gap-1">
                <Layers className="w-3 h-3 text-indigo-400" /> Categories:
              </span>
              {categories.map((cat) => {
                const isActive = (searchQuery.category || 'All') === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategorySelect(cat)}
                    className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${
                      isActive
                        ? 'bg-white text-slate-900'
                        : 'border border-white/20 text-white/80 hover:bg-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchQuery((prev) => ({
                      ...prev,
                      keyword: '',
                      category: 'All',
                      amenities: [],
                      maxPrice: 1000,
                    }))
                  }
                  className="text-xs font-mono uppercase tracking-wider text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Filters
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-mono uppercase tracking-wider text-indigo-300 hover:text-white flex items-center gap-1 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                {showAdvanced ? 'Hide Amenities' : 'More Filters'}
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
              <div>
                <label className="text-[10px] uppercase tracking-widest opacity-60 font-semibold mb-2 flex justify-between">
                  <span>Max Price Per Night</span>
                  <span className="text-white font-mono font-bold">${searchQuery.maxPrice || 1000}</span>
                </label>
                <input
                  type="range"
                  min={100}
                  max={1000}
                  step={25}
                  value={searchQuery.maxPrice || 1000}
                  onChange={(e) => setSearchQuery((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))}
                  className="w-full accent-indigo-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest opacity-60 font-semibold mb-2 block">
                  Select Included Amenities
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableAmenities.map((amenity) => {
                    const isChecked = (searchQuery.amenities || []).includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => toggleAmenity(amenity)}
                        className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono transition-colors border ${
                          isChecked
                            ? 'bg-indigo-600 border-indigo-500 text-white font-bold'
                            : 'border-white/20 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 text-white" />}
                        {amenity}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </section>
  );
};

