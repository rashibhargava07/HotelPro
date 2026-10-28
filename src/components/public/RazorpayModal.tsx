import React, { useState, useEffect } from 'react';
import { Booking } from '../../types';
import { useHotelProStore } from '../../hooks/useHotelProStore';
import { X, ShieldCheck, CreditCard, Smartphone, Building, Clock, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RazorpayModalProps {
  booking: Booking;
  onClose: () => void;
  onPaymentSuccess: (booking: Booking) => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({ booking, onClose, onPaymentSuccess }) => {
  const { actions } = useHotelProStore();

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('4111 •••• •••• 1111');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('888');
  const [upiId, setUpiId] = useState('guest@oksbi');

  // 15-minute countdown timer calculation
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15 * 60);

  useEffect(() => {
    if (!booking.inventoryHoldExpiresAt) return;
    const target = new Date(booking.inventoryHoldExpiresAt).getTime();

    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((target - Date.now()) / 1000));
      setSecondsRemaining(diff);
      if (diff <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [booking.inventoryHoldExpiresAt]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const handlePay = () => {
    setIsProcessing(true);

    setTimeout(() => {
      try {
        const { booking: updatedBooking } = actions.confirmPayment(booking.id, paymentMethod);

        // Fire celebratory luxury confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0F2C59', '#C5A880', '#1B5E20', '#FAF8ED'],
        });

        setIsProcessing(false);
        onPaymentSuccess(updatedBooking);
      } catch (err) {
        setIsProcessing(false);
        alert('Payment processing error');
      }
    }, 1200);
  };

  const isHoldExpired = secondsRemaining <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Razorpay Brand Bar */}
        <div className="bg-[#0c2340] text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold font-mono text-sm shadow">
              R
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-blue-300 font-bold flex items-center gap-1">
                <span>Razorpay Sandbox</span>
                <span className="text-[10px] bg-blue-600/40 text-blue-200 px-1 rounded">MOCK</span>
              </div>
              <h3 className="font-bold text-white text-base">HotelPro Luxury Escapes</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hold Countdown & Total Payable banner */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Payable Amount</span>
            <span className="text-2xl font-bold font-serif text-amber-300">
              ₹{booking.priceBreakdown.totalAmount.toLocaleString()}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 block font-medium flex items-center gap-1 justify-end">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Hold Expires In</span>
            </span>
            <span className={`text-base font-mono font-bold ${secondsRemaining < 120 ? 'text-rose-400 animate-pulse' : 'text-slate-200'}`}>
              {timeFormatted}
            </span>
          </div>
        </div>

        {isHoldExpired ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-800">15-Minute Inventory Hold Expired</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              To guarantee fairness during peak reservations, your room hold has timed out. Please select your dates again to check live availability.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#0F2C59] text-white font-bold text-xs"
            >
              Back to Sanctuaries
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Booking Details Snapshot */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-400 block">Booking Reference</span>
                <span className="font-mono font-bold text-[#0F2C59]">{booking.bookingReference}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">Room Allocated</span>
                <span className="font-bold text-slate-800">
                  Room {booking.roomDetailsSnapshot.roomNumber} ({booking.roomDetailsSnapshot.categoryName})
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Choose Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition ${
                    paymentMethod === 'card'
                      ? 'border-[#0F2C59] bg-[#0F2C59]/5 text-[#0F2C59] ring-1 ring-[#0F2C59]'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-[#0F2C59]" />
                  <span>Debit / Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition ${
                    paymentMethod === 'upi'
                      ? 'border-[#0F2C59] bg-[#0F2C59]/5 text-[#0F2C59] ring-1 ring-[#0F2C59]'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition ${
                    paymentMethod === 'netbanking'
                      ? 'border-[#0F2C59] bg-[#0F2C59]/5 text-[#0F2C59] ring-1 ring-[#0F2C59]'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Building className="w-4 h-4 text-amber-600" />
                  <span>NetBanking</span>
                </button>
              </div>
            </div>

            {/* Payment Method Inputs */}
            {paymentMethod === 'card' && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Card Number (Sandbox Test Card)</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Expiry</label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">CVV</label>
                    <input
                      type="password"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'upi' && (
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 text-xs space-y-2">
                <label className="block text-emerald-900 font-semibold">Virtual Payment Address (VPA / UPI ID)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg font-mono text-sm text-emerald-950"
                />
                <p className="text-[11px] text-emerald-700">
                  Simulated sandbox VPA: Autotested with instant authorization.
                </p>
              </div>
            )}

            {paymentMethod === 'netbanking' && (
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 text-xs space-y-2">
                <label className="block text-amber-900 font-semibold">Popular Indian Banks</label>
                <div className="grid grid-cols-3 gap-2">
                  <span className="p-2 bg-white rounded-lg border border-amber-300 text-center font-bold text-slate-800">HDFC</span>
                  <span className="p-2 bg-white rounded-lg border border-amber-300 text-center font-bold text-slate-800">ICICI</span>
                  <span className="p-2 bg-white rounded-lg border border-amber-300 text-center font-bold text-slate-800">SBI</span>
                </div>
              </div>
            )}

            {/* Pay Button */}
            <button
              onClick={handlePay}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying Razorpay Signature...
                </span>
              ) : (
                <span>Pay ₹{booking.priceBreakdown.totalAmount.toLocaleString()} & Confirm Reservation</span>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-bit SSL Encrypted • Razorpay Certified Payment Gateway</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
