import React, { useState, useMemo } from 'react';
import { useHotelProStore } from '../../hooks/useHotelProStore';
import { RoomCategory } from '../../types';
import {
  MapPin,
  Calendar,
  Users,
  CheckCircle2,
  Sparkles,
  Wifi,
  Waves,
  Coffee,
  ShieldCheck,
  Clock,
  ArrowRight,
  Info,
} from 'lucide-react';
import { ReviewSection } from './ReviewSection';

interface HotelShowcaseProps {

  onSelectCategoryForBooking: (category: RoomCategory, checkIn: string, checkOut: string, adults: number, children: number) => void;
}

export const HotelShowcase: React.FC<HotelShowcaseProps> = ({ onSelectCategoryForBooking }) => {
  const { activeHotel, categories, rooms, actions } = useHotelProStore();

  // Date calculation defaults: Today to +2 days
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }, []);

  const defaultOutStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  }, []);

  const [checkIn, setCheckIn] = useState<string>(todayStr);
  const [checkOut, setCheckOut] = useState<string>(defaultOutStr);
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('all');

  // Validate dates
  const isValidDateRange = useMemo(() => {
    if (!checkIn || !checkOut) return false;
    return new Date(checkOut) > new Date(checkIn);
  }, [checkIn, checkOut]);

  // Compute available rooms per category for the current dates
  const categoryAvailability = useMemo(() => {
    const activeHotelCategories = categories.filter((c) => c.hotelId === activeHotel.id && c.active);
    const map: Record<string, { availableRoomsCount: number; quote: ReturnType<typeof actions.calculateBookingQuote> }> = {};

    activeHotelCategories.forEach((cat) => {
      const matchingRooms = rooms.filter(
        (r) => r.hotelId === activeHotel.id && r.categoryId === cat.id && r.active && r.operationalStatus === 'available'
      );

      const availableRooms = matchingRooms.filter((r) =>
        isValidDateRange ? actions.isRoomAvailable(r.id, checkIn, checkOut) : true
      );

      const quote = actions.calculateBookingQuote(
        cat.basePrice,
        isValidDateRange ? checkIn : todayStr,
        isValidDateRange ? checkOut : defaultOutStr
      );

      map[cat.id] = {
        availableRoomsCount: availableRooms.length,
        quote,
      };
    });

    return map;
  }, [categories, rooms, activeHotel.id, checkIn, checkOut, isValidDateRange, actions, todayStr, defaultOutStr]);

  const hotelCategories = categories.filter((c) => c.hotelId === activeHotel.id && c.active);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Section */}
      <section className="relative bg-[#0F2C59] text-white overflow-hidden shadow-xl">
        <div className="absolute inset-0 z-0">
          <img
            src={activeHotel.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80'}
            alt={activeHotel.name}
            className="w-full h-full object-cover opacity-25 filter brightness-75 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F2C59] via-[#0F2C59]/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-200 text-xs font-semibold mb-6 tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Luxury Sanctuary Collection • 5-Star Heritage Certified</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-white max-w-3xl leading-[1.15] mb-6">
            {activeHotel.name}
          </h1>

          <p className="text-lg sm:text-xl text-slate-200 max-w-2xl font-normal leading-relaxed mb-8">
            {activeHotel.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>{activeHotel.address}, {activeHotel.city}, {activeHotel.state}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Check-in: {activeHotel.checkInTime} • Check-out: {activeHotel.checkOutTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{activeHotel.policies.cancellation}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Date & Occupancy Search Filter Card */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Check-In */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#0F2C59]" />
                <span>Check-In Date</span>
              </label>
              <input
                type="date"
                value={checkIn}
                min={todayStr}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2C59] transition"
              />
            </div>

            {/* Check-Out */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#0F2C59]" />
                <span>Check-Out Date</span>
              </label>
              <input
                type="date"
                value={checkOut}
                min={checkIn || todayStr}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2C59] transition"
              />
            </div>

            {/* Guests: Adults & Children */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#0F2C59]" />
                <span>Guests & Travelers</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F2C59]"
                >
                  <option value={1}>1 Adult</option>
                  <option value={2}>2 Adults</option>
                  <option value={3}>3 Adults</option>
                  <option value={4}>4 Adults</option>
                </select>
                <select
                  value={children}
                  onChange={(e) => setChildren(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F2C59]"
                >
                  <option value={0}>0 Children</option>
                  <option value={1}>1 Child</option>
                  <option value={2}>2 Children</option>
                </select>
              </div>
            </div>

            {/* Filter Summary Button */}
            <div>
              <div className="text-[11px] text-slate-500 font-medium mb-1.5 flex items-center justify-between">
                <span>Selected Interval</span>
                {isValidDateRange && (
                  <span className="font-bold text-amber-700">
                    {Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))} Nights
                  </span>
                )}
              </div>
              <div className="w-full py-2.5 px-4 bg-slate-100 rounded-xl flex items-center justify-between text-xs font-semibold text-slate-700 border border-slate-200">
                <span>Live Rates Applied</span>
                <span className="inline-flex items-center gap-1 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Overlap Protected
                </span>
              </div>
            </div>
          </div>

          {!isValidDateRange && (
            <p className="mt-3 text-xs text-rose-600 font-semibold flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> Check-out date must occur strictly after check-in date.
            </p>
          )}
        </div>
      </div>

      {/* Room Chambers & Suites Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-serif font-bold text-[#0F2C59] tracking-tight">
              Palatial Chambers & Suites
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Hand-carved jharokhas, bespoke Italian marble baths, and royal lakeside views.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Included:</span>
            <span className="text-xs bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-full font-semibold">
              ✨ Royal Butler Service
            </span>
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-semibold">
              ☕ Artisan Breakfast
            </span>
          </div>
        </div>

        {/* Room Category Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {hotelCategories.map((category) => {
            const avail = categoryAvailability[category.id] || {
              availableRoomsCount: 0,
              quote: actions.calculateBookingQuote(category.basePrice, checkIn, checkOut),
            };
            const isSoldOut = avail.availableRoomsCount === 0;

            return (
              <div
                key={category.id}
                className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200/90 flex flex-col group"
              >
                {/* Photo Gallery Header */}
                <div className="relative h-64 sm:h-72 overflow-hidden bg-slate-800">
                  <img
                    src={category.images[0] || activeHotel.images[0]}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                  {/* Bed & Capacity badge */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className="bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/20">
                      {category.bedConfiguration}
                    </span>
                    <span className="bg-[#0F2C59]/90 backdrop-blur-md text-amber-300 text-xs font-semibold px-3 py-1 rounded-full border border-amber-400/30">
                      Up to {category.capacity.adults} Adults
                    </span>
                  </div>

                  {/* Availability badge */}
                  <div className="absolute top-4 right-4">
                    {isSoldOut ? (
                      <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        Sold Out for Selected Dates
                      </span>
                    ) : (
                      <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {avail.availableRoomsCount} Chamber{avail.availableRoomsCount > 1 ? 's' : ''} Available
                      </span>
                    )}
                  </div>

                  {/* Category Title Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-2xl font-serif font-bold text-white tracking-wide drop-shadow-sm">
                      {category.name}
                    </h3>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                      {category.description}
                    </p>

                    {/* Amenities pills */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {category.amenities.map((amenity, i) => (
                        <span
                          key={i}
                          className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium border border-slate-200 flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>{amenity}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Breakdown & Action Row */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-bold font-serif text-[#0F2C59]">
                          ₹{category.basePrice.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">/ night</span>
                      </div>

                      {/* Weekend & Taxes notice */}
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {avail.quote.weekendSurcharge > 0 && (
                          <span className="text-amber-800 font-semibold bg-amber-50 px-1.5 py-0.5 rounded mr-1">
                            Includes Fri/Sat +15% Surge
                          </span>
                        )}
                        <span>+ 12% GST & Concierge</span>
                      </div>
                    </div>

                    <button
                      disabled={isSoldOut || !isValidDateRange}
                      onClick={() => onSelectCategoryForBooking(category, checkIn, checkOut, adults, children)}
                      className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${
                        isSoldOut || !isValidDateRange
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-[#0F2C59] hover:bg-[#081a36] text-[#FAF8ED] hover:shadow-md hover:scale-[1.02] cursor-pointer'
                      }`}
                    >
                      <span>{isSoldOut ? 'Unavailable' : 'Reserve Chamber'}</span>
                      {!isSoldOut && <ArrowRight className="w-4 h-4 text-amber-300" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Hotel Amenities & Experiences Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="bg-gradient-to-br from-white to-slate-100 rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase tracking-widest font-bold text-amber-700 bg-amber-100/60 px-3 py-1 rounded-full">
              Sanctuary Amenities
            </span>
            <h3 className="text-3xl font-serif font-bold text-[#0F2C59] mt-3">
              Imperial Amenities & Royal Hospitality
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Every detail engineered for serene tranquility, effortless wellness, and uninterrupted privacy.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {activeHotel.amenities.map((amenity, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3 hover:border-amber-300 transition"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-amber-700" />
                </div>
                <span className="text-xs font-semibold text-slate-800">{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verified Guest Reviews & Ratings Section */}
      <ReviewSection hotelId={activeHotel.id} />
    </div>
  );
};

