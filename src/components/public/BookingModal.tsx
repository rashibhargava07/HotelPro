import React, { useState, useMemo } from 'react';
import { useHotelProStore } from '../../hooks/useHotelProStore';
import { RoomCategory, Room, Booking } from '../../types';
import { X, Calendar, Clock, User, Mail, Phone, MessageSquare, ShieldCheck, Sparkles, CreditCard, AlertCircle } from 'lucide-react';

interface BookingModalProps {
  category: RoomCategory;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  onClose: () => void;
  onHoldCreated: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  category,
  checkIn,
  checkOut,
  adults,
  children,
  onClose,
  onHoldCreated,
}) => {
  const { currentUser, rooms, activeHotel, actions } = useHotelProStore();

  // Find candidate available physical room in this category
  const availableRooms = useMemo(() => {
    return rooms.filter(
      (r) =>
        r.hotelId === activeHotel.id &&
        r.categoryId === category.id &&
        r.active &&
        r.operationalStatus === 'available' &&
        actions.isRoomAvailable(r.id, checkIn, checkOut)
    );
  }, [rooms, activeHotel.id, category.id, checkIn, checkOut, actions]);

  const [selectedRoomId, setSelectedRoomId] = useState<string>(availableRooms[0]?.id || '');
  const [name, setName] = useState<string>(currentUser.name || '');
  const [email, setEmail] = useState<string>(currentUser.email || '');
  const [phone, setPhone] = useState<string>(currentUser.phone || '+91 98765 43210');
  const [specialRequests, setSpecialRequests] = useState<string>('Late check-in requested if possible.');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const quote = useMemo(() => {
    return actions.calculateBookingQuote(category.basePrice, checkIn, checkOut);
  }, [category.basePrice, checkIn, checkOut, actions]);

  const handleSubmitHold = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedRoomId) {
      setErrorMsg('No available physical room in this category for the selected dates.');
      return;
    }

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg('Please provide guest name, email, and contact telephone number.');
      return;
    }

    try {
      const booking = actions.createBookingHold({
        hotelId: activeHotel.id,
        roomId: selectedRoomId,
        checkIn,
        checkOut,
        numberOfAdults: adults,
        numberOfChildren: children,
        guestDetails: {
          name,
          email,
          phone,
          specialRequests,
        },
      });

      onHoldCreated(booking);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create inventory hold.');
    }
  };

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#0F2C59] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-300 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Instant Reservation • 15-Minute Inventory Hold</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-white">
            Reserve: {category.name}
          </h2>
          <p className="text-xs text-slate-200 mt-1">
            {activeHotel.name} • {activeHotel.city}, {activeHotel.state}
          </p>
        </div>

        <form onSubmit={handleSubmitHold} className="p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Stay Summary Bar */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Check-In</span>
              <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-[#0F2C59]" />
                {checkIn}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Check-Out</span>
              <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-[#0F2C59]" />
                {checkOut}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Duration</span>
              <span className="font-bold text-amber-800 flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                {quote.nights} Night{quote.nights > 1 ? 's' : ''}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Room Number</span>
              <span className="font-bold text-emerald-800 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Room {selectedRoom?.roomNumber || 'Auto-Allocated'}
              </span>
            </div>
          </div>

          {/* Room Allocation Choice if multiple available */}
          {availableRooms.length > 1 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Select Physical Room / Floor
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableRooms.map((r) => (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => setSelectedRoomId(r.id)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition flex items-center justify-between ${
                      selectedRoomId === r.id
                        ? 'border-[#0F2C59] bg-[#0F2C59]/5 text-[#0F2C59] ring-1 ring-[#0F2C59]'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span>Room {r.roomNumber} (Floor {r.floor})</span>
                    <span className="text-[10px] text-emerald-600 font-bold uppercase">Ready</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Guest Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F2C59] flex items-center gap-1.5 border-b pb-2">
              <User className="w-4 h-4 text-amber-600" />
              <span>Primary Guest Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name (as per ID proof) *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2C59]"
                    placeholder="e.g. Vikram Malhotra"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2C59]"
                    placeholder="guest@hotelpro.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Contact *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2C59]"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Special Concierge Wishes
                </label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2C59]"
                    placeholder="Anniversary, quiet floor, extra pillows..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Price Quotation Card */}
          <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200/80 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Chamber Base Rate ({quote.nights} nights × ₹{quote.baseRatePerNight.toLocaleString()})</span>
              <span>₹{(quote.baseRatePerNight * quote.nights).toLocaleString()}</span>
            </div>

            {quote.weekendSurcharge > 0 && (
              <div className="flex justify-between text-amber-800 font-semibold">
                <span>Weekend Surcharge (Friday & Saturday +15%)</span>
                <span>+ ₹{quote.weekendSurcharge.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-medium">₹{quote.subtotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Standard Hospitality GST (12%)</span>
              <span>+ ₹{quote.taxAmount.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Nominal Concierge & Sanitation Fee</span>
              <span>+ ₹{quote.fees.toLocaleString()}</span>
            </div>

            <div className="pt-2 border-t border-amber-200/80 flex justify-between items-baseline text-sm font-bold text-[#0F2C59]">
              <span className="font-serif text-base">Total Payable Amount</span>
              <span className="text-xl font-bold font-serif text-[#0F2C59]">
                ₹{quote.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>15-min temporary concurrency hold placed upon clicking proceed.</span>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#0F2C59] hover:bg-[#081a36] text-[#FAF8ED] font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-amber-300" />
              <span>Hold Chamber & Pay ₹{quote.totalAmount.toLocaleString()}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
