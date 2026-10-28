/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useHotelProStore } from './hooks/useHotelProStore';
import { PersonaBanner } from './components/common/PersonaBanner';
import { Navbar, ActiveTab } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { SignInModal } from './components/common/SignInModal';
import { HotelShowcase } from './components/public/HotelShowcase';
import { BookingModal } from './components/public/BookingModal';
import { RazorpayModal } from './components/public/RazorpayModal';
import { BookingConfirmationModal } from './components/public/BookingConfirmationModal';
import { GuestDashboard } from './components/guest/GuestDashboard';
import { StaffDashboard } from './components/staff/StaffDashboard';
import { ManagerDashboard } from './components/manager/ManagerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SystemDocsModal } from './components/docs/SystemDocsModal';
import { RoomCategory, Booking } from './types';

export default function App() {
  const { currentUser } = useHotelProStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>('explore');
  const [showDocsModal, setShowDocsModal] = useState<boolean>(false);
  const [showSignInModal, setShowSignInModal] = useState<boolean>(false);

  // Booking Flow State
  const [bookingSelection, setBookingSelection] = useState<{
    category: RoomCategory;
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
  } | null>(null);

  const [pendingHoldBooking, setPendingHoldBooking] = useState<Booking | null>(null);
  const [confirmedVoucherBooking, setConfirmedVoucherBooking] = useState<Booking | null>(null);

  const handleSelectCategoryForBooking = (
    category: RoomCategory,
    checkIn: string,
    checkOut: string,
    adults: number,
    children: number
  ) => {
    setBookingSelection({ category, checkIn, checkOut, adults, children });
  };

  const handleHoldCreated = (booking: Booking) => {
    setBookingSelection(null);
    setPendingHoldBooking(booking);
  };

  const handlePaymentSuccess = (booking: Booking) => {
    setPendingHoldBooking(null);
    setConfirmedVoucherBooking(booking);
  };

  const handleGoToGuestDashboard = () => {
    setConfirmedVoucherBooking(null);
    setActiveTab('guest_bookings');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8ED]/40 text-slate-800 antialiased selection:bg-amber-200 selection:text-slate-900">
      {/* Persona Simulation Switcher Bar */}
      <PersonaBanner onOpenDocs={() => setShowDocsModal(true)} />

      {/* Main Luxury Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenSignIn={() => setShowSignInModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'explore' && (
          <HotelShowcase onSelectCategoryForBooking={handleSelectCategoryForBooking} />
        )}

        {activeTab === 'guest_bookings' && (
          <GuestDashboard
            onViewVoucher={(b) => setConfirmedVoucherBooking(b)}
            onExplore={() => setActiveTab('explore')}
          />
        )}

        {activeTab === 'staff_desk' && <StaffDashboard />}

        {activeTab === 'manager_ops' && <ManagerDashboard />}

        {activeTab === 'admin_center' && <AdminDashboard />}
      </main>

      {/* Footer */}
      <Footer onOpenDocs={() => setShowDocsModal(true)} />

      {/* Booking Step 1: Chamber Hold Modal */}
      {bookingSelection && (
        <BookingModal
          category={bookingSelection.category}
          checkIn={bookingSelection.checkIn}
          checkOut={bookingSelection.checkOut}
          adults={bookingSelection.adults}
          children={bookingSelection.children}
          onClose={() => setBookingSelection(null)}
          onHoldCreated={handleHoldCreated}
        />
      )}

      {/* Booking Step 2: Razorpay 15-Min Hold Checkout Modal */}
      {pendingHoldBooking && (
        <RazorpayModal
          booking={pendingHoldBooking}
          onClose={() => setPendingHoldBooking(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Booking Step 3: Confirmed Voucher Modal */}
      {confirmedVoucherBooking && (
        <BookingConfirmationModal
          booking={confirmedVoucherBooking}
          onClose={() => setConfirmedVoucherBooking(null)}
          onGoToDashboard={handleGoToGuestDashboard}
        />
      )}

      {/* Persona Sign In / Profile Switcher Modal */}
      {showSignInModal && (
        <SignInModal onClose={() => setShowSignInModal(false)} />
      )}

      {/* Architecture & Code Specification Modal */}
      {showDocsModal && (
        <SystemDocsModal onClose={() => setShowDocsModal(false)} />
      )}
    </div>
  );
}
