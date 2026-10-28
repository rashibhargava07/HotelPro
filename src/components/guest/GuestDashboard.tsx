import React, { useState } from 'react';
import { useHotelProStore } from '../../hooks/useHotelProStore';
import { Booking, ServiceRequestCategory } from '../../types';
import {
  CalendarCheck,
  MapPin,
  Clock,
  Printer,
  XCircle,
  Bell,
  Sparkles,
  Coffee,
  CheckCircle2,
  AlertTriangle,
  Send,
  Eye,
  Star,
} from 'lucide-react';


interface GuestDashboardProps {
  onViewVoucher: (booking: Booking) => void;
  onExplore: () => void;
}

export const GuestDashboard: React.FC<GuestDashboardProps> = ({ onViewVoucher, onExplore }) => {
  const { currentUser, bookings, hotels, serviceRequests, actions } = useHotelProStore();

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'past' | 'cancelled'>('all');
  const [selectedBookingForService, setSelectedBookingForService] = useState<Booking | null>(null);
  const [serviceCategory, setServiceCategory] = useState<ServiceRequestCategory>('room_service');
  const [serviceDescription, setServiceDescription] = useState('');
  const [servicePriority, setServicePriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [serviceSuccess, setServiceSuccess] = useState(false);

  // Filter bookings for current guest
  const myBookings = bookings.filter((b) => b.guestId === currentUser.id);

  const filteredBookings = myBookings.filter((b) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return ['confirmed', 'checked_in', 'pending_payment'].includes(b.bookingStatus);
    if (activeTab === 'past') return b.bookingStatus === 'checked_out';
    if (activeTab === 'cancelled') return b.bookingStatus === 'cancelled';
    return true;
  });

  const myServiceRequests = serviceRequests.filter((r) => r.guestId === currentUser.id);

  const handleCancelBooking = (booking: Booking) => {
    if (confirm(`Are you sure you want to cancel reservation ${booking.bookingReference}? Full refund of ₹${booking.priceBreakdown.totalAmount.toLocaleString()} will be credited.`)) {
      actions.cancelBooking(booking.id, 'Cancelled via Guest Portal');
    }
  };

  const handleCreateServiceRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForService || !serviceDescription.trim()) return;

    actions.createServiceRequest({
      hotelId: selectedBookingForService.hotelId,
      roomId: selectedBookingForService.roomId,
      roomNumber: selectedBookingForService.roomDetailsSnapshot.roomNumber,
      bookingId: selectedBookingForService.id,
      category: serviceCategory,
      description: serviceDescription.trim(),
      priority: servicePriority,
    });

    setServiceSuccess(true);
    setServiceDescription('');
    setTimeout(() => {
      setServiceSuccess(false);
      setSelectedBookingForService(null);
    }, 1800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Royal Guest Portfolio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#0F2C59]">
            My Palatial Reservations
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Welcome back, <span className="font-semibold text-slate-900">{currentUser.name}</span>. Manage upcoming itineraries and in-stay concierge requests.
          </p>
        </div>

        <button
          onClick={onExplore}
          className="px-5 py-2.5 rounded-xl bg-[#0F2C59] text-white hover:bg-[#081a36] text-xs font-bold transition shadow-xs"
        >
          Book Another Sanctuary
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-8 overflow-x-auto">
        {[
          { id: 'all', label: `All Stays (${myBookings.length})` },
          { id: 'active', label: 'Upcoming & In-Stay' },
          { id: 'past', label: 'Past Stays' },
          { id: 'cancelled', label: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#0F2C59] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No Reservations Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You do not currently have any stays in this category. Explore our royal sanctuaries across India.
          </p>
          <button
            onClick={onExplore}
            className="mt-5 px-6 py-2.5 rounded-xl bg-[#0F2C59] text-white text-xs font-bold shadow hover:bg-[#081a36] transition"
          >
            Explore Sanctuaries
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredBookings.map((b) => {
            const hotel = hotels.find((h) => h.id === b.hotelId) || hotels[0];
            const isCurrentlyCheckedIn = b.bookingStatus === 'checked_in';
            const isConfirmed = b.bookingStatus === 'confirmed';

            return (
              <div
                key={b.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition duration-200"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
                  {/* Photo & Hotel Details */}
                  <div className="lg:col-span-4 flex flex-col justify-between">
                    <div>
                      <div className="relative h-44 rounded-2xl overflow-hidden mb-3 bg-slate-800">
                        <img
                          src={hotel.images[0]}
                          alt={hotel.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3">
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm ${
                              isCurrentlyCheckedIn
                                ? 'bg-emerald-600 text-white animate-pulse'
                                : isConfirmed
                                ? 'bg-[#0F2C59] text-amber-300 border border-amber-300/40'
                                : b.bookingStatus === 'checked_out'
                                ? 'bg-slate-700 text-slate-200'
                                : 'bg-rose-600 text-white'
                            }`}
                          >
                            {b.bookingStatus === 'checked_in'
                              ? 'In-Stay Active'
                              : b.bookingStatus.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-serif font-bold text-lg text-[#0F2C59]">
                        {hotel.name}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                        <span>{hotel.city}, {hotel.state}</span>
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-mono">Ref: {b.bookingReference}</span>
                      <button
                        onClick={() => onViewVoucher(b)}
                        className="text-[#0F2C59] hover:underline font-bold flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Voucher</span>
                      </button>
                    </div>
                  </div>

                  {/* Stay Itinerary & Chamber Details */}
                  <div className="lg:col-span-5 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-amber-700">
                          Chamber Details
                        </span>
                        <div className="text-base font-bold text-slate-900 mt-0.5">
                          Room {b.roomDetailsSnapshot.roomNumber} • {b.roomDetailsSnapshot.categoryName}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {b.numberOfAdults} Adults {b.numberOfChildren > 0 ? `• ${b.numberOfChildren} Children` : ''}
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                        <div>
                          <span className="text-slate-400 block font-medium">Check-In</span>
                          <span className="font-bold text-slate-800 text-sm">{b.checkIn}</span>
                          <span className="text-[10px] text-slate-500">From {hotel.checkInTime}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Check-Out</span>
                          <span className="font-bold text-slate-800 text-sm">{b.checkOut}</span>
                          <span className="text-[10px] text-slate-500">Until {hotel.checkOutTime}</span>
                        </div>
                      </div>

                      {b.guestDetailsSnapshot.specialRequests && (
                        <div className="text-xs text-slate-600 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/60">
                          <span className="font-bold text-amber-900">Concierge Notes: </span>
                          <span>{b.guestDetailsSnapshot.specialRequests}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Financial Breakdown & In-Stay Actions */}
                  <div className="lg:col-span-3 flex flex-col justify-between bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                        Total Amount Paid
                      </span>
                      <span className="text-2xl font-serif font-bold text-[#0F2C59] mt-0.5 block">
                        ₹{b.priceBreakdown.totalAmount.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {b.priceBreakdown.nights} Nights • GST Paid
                      </span>
                    </div>

                    <div className="space-y-2 mt-4 pt-4 border-t border-slate-200">
                      {isCurrentlyCheckedIn && (
                        <button
                          onClick={() => setSelectedBookingForService(b)}
                          className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                        >
                          <Bell className="w-3.5 h-3.5" />
                          <span>Request In-Stay Service</span>
                        </button>
                      )}

                      {isConfirmed && (
                        <button
                          onClick={() => handleCancelBooking(b)}
                          className="w-full py-2 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel Stay</span>
                        </button>
                      )}

                      {b.bookingStatus === 'checked_out' && (
                        <button
                          onClick={onExplore}
                          className="w-full py-2 px-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>Rate Concluded Stay</span>
                        </button>
                      )}

                      <button
                        onClick={() => onViewVoucher(b)}
                        className="w-full py-2 px-3 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        <span>Print Voucher</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* In-Stay Service Requests Tracker */}
      {myServiceRequests.length > 0 && (
        <div className="mt-16">
          <h3 className="text-xl font-serif font-bold text-[#0F2C59] mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-600" />
            <span>Active In-Stay Concierge Requests</span>
          </h3>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="divide-y divide-slate-100">
              {myServiceRequests.map((req) => (
                <div key={req.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Room {req.roomNumber}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900 capitalize">
                        {req.category.replace('_', ' ')}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          req.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800 animate-pulse'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 font-medium">{req.description}</p>
                  </div>

                  <div className="text-xs text-slate-400">
                    {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* In-Stay Service Request Modal */}
      {selectedBookingForService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  Concierge Dispatch
                </span>
                <h3 className="text-lg font-serif font-bold text-[#0F2C59]">
                  Room {selectedBookingForService.roomDetailsSnapshot.roomNumber} Service
                </h3>
              </div>
              <button
                onClick={() => setSelectedBookingForService(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                ✕
              </button>
            </div>

            {serviceSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-bold text-slate-800">Concierge Dispatched!</h4>
                <p className="text-xs text-slate-500">
                  Our royal butler and front desk staff have been notified immediately.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateServiceRequest} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Service Category</label>
                  <select
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800"
                  >
                    <option value="room_service">Imperial In-Room Dining & Drinks</option>
                    <option value="towels_bedding">Fresh Linens & Egyptian Towels</option>
                    <option value="maintenance">Technical / AC / Plumbing Maintenance</option>
                    <option value="concierge">Concierge, Transfers & Spa Bookings</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Urgency Priority</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['low', 'medium', 'high'].map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setServicePriority(p as any)}
                        className={`p-2 rounded-lg font-bold uppercase text-[10px] border transition ${
                          servicePriority === p
                            ? 'bg-[#0F2C59] text-white border-[#0F2C59]'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">What can we arrange for you?</label>
                  <textarea
                    rows={3}
                    required
                    value={serviceDescription}
                    onChange={(e) => setServiceDescription(e.target.value)}
                    placeholder="e.g. 2 extra bathrobes, ice bucket, or vegan breakfast to room at 08:30..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:bg-white"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBookingForService(null)}
                    className="px-4 py-2 rounded-xl text-slate-600 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#0F2C59] text-white font-bold flex items-center gap-1.5 shadow"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch Butler</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
