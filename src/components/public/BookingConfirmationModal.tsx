import React from 'react';
import { Booking } from '../../types';
import { useHotelProStore } from '../../hooks/useHotelProStore';
import { CheckCircle2, Crown, Calendar, MapPin, Printer, ArrowRight, X, Sparkles, QrCode } from 'lucide-react';

interface BookingConfirmationModalProps {
  booking: Booking;
  onClose: () => void;
  onGoToDashboard: () => void;
}

export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  booking,
  onClose,
  onGoToDashboard,
}) => {
  const { hotels } = useHotelProStore();
  const hotel = hotels.find((h) => h.id === booking.hotelId) || hotels[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Palace Header Banner */}
        <div className="bg-gradient-to-r from-[#0F2C59] to-[#081a36] text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-300 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-[11px] font-bold tracking-widest text-amber-300 uppercase block mb-1">
            Confirmed Sanctuary Reservation
          </span>
          <h2 className="text-2xl font-serif font-bold text-white">
            Welcome to {hotel.name}
          </h2>
          <p className="text-xs text-slate-300 mt-1 flex items-center justify-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>{hotel.city}, {hotel.state}</span>
          </p>
        </div>

        {/* Voucher Body */}
        <div className="p-6 space-y-6">
          {/* Reference & QR Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-300 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Booking Reference Code
              </span>
              <span className="text-2xl font-mono font-bold text-[#0F2C59] tracking-wider">
                {booking.bookingReference}
              </span>
              <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Payment Received • Guaranteed
              </span>
            </div>

            <div className="w-16 h-16 rounded-xl bg-white p-1 border border-slate-200 shadow-xs flex flex-col items-center justify-center text-slate-700">
              <QrCode className="w-10 h-10 text-slate-800" />
              <span className="text-[8px] font-mono font-bold mt-0.5">CHECK-IN</span>
            </div>
          </div>

          {/* Key Stay Details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block font-medium">Guest Name</span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                {booking.guestDetailsSnapshot.name}
              </span>
              <span className="text-[11px] text-slate-500">{booking.guestDetailsSnapshot.email}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block font-medium">Allocated Chamber</span>
              <span className="font-bold text-[#0F2C59] text-sm mt-0.5 block">
                Room {booking.roomDetailsSnapshot.roomNumber}
              </span>
              <span className="text-[11px] text-slate-500">{booking.roomDetailsSnapshot.categoryName}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block font-medium">Check-In</span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                {booking.checkIn}
              </span>
              <span className="text-[11px] text-slate-500">From {hotel.checkInTime}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block font-medium">Check-Out</span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                {booking.checkOut}
              </span>
              <span className="text-[11px] text-slate-500">Until {hotel.checkOutTime}</span>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="border-t border-slate-200 pt-3 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Duration</span>
              <span className="font-medium">{booking.priceBreakdown.nights} Nights</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Subtotal & Taxes</span>
              <span>₹{booking.priceBreakdown.subtotal.toLocaleString()} + ₹{booking.priceBreakdown.taxAmount.toLocaleString()} GST</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-[#0F2C59] pt-1 border-t border-slate-100">
              <span>Total Paid via Razorpay</span>
              <span className="font-serif text-base">₹{booking.priceBreakdown.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print Reservation Voucher</span>
            </button>

            <button
              onClick={onGoToDashboard}
              className="flex-1 py-2.5 rounded-xl bg-[#0F2C59] hover:bg-[#081a36] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              <span>Manage in My Reservations</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
