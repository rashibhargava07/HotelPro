import React from 'react';
import { useHotelProStore } from '../../hooks/useHotelProStore';
import { Crown, Compass, CalendarCheck, ClipboardList, BarChart3, Shield, User as UserIcon, LogOut } from 'lucide-react';

export type ActiveTab = 'explore' | 'guest_bookings' | 'staff_desk' | 'manager_ops' | 'admin_center';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenSignIn: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab, onOpenSignIn }) => {
  const { currentUser, bookings, housekeepingTasks, serviceRequests, actions } = useHotelProStore();

  const myGuestBookingsCount = bookings.filter((b) => b.guestId === currentUser.id && b.bookingStatus !== 'cancelled').length;
  const pendingStaffTasks = housekeepingTasks.filter((t) => t.status !== 'completed').length +
    serviceRequests.filter((s) => s.status === 'open').length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Luxury Branding */}
          <div
            onClick={() => onSelectTab('explore')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F2C59] to-[#081a36] text-[#FAF8ED] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Crown className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-2xl font-bold tracking-tight text-[#0F2C59]">
                  HotelPro
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                  Palace & Spa
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Boutique Hospitality & Property Management</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => onSelectTab('explore')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'explore'
                  ? 'bg-[#0F2C59] text-white shadow-xs'
                  : 'text-slate-700 hover:text-[#0F2C59] hover:bg-slate-100'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Explore Sanctuaries</span>
            </button>

            {/* Guest Bookings */}
            <button
              onClick={() => onSelectTab('guest_bookings')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 relative ${
                activeTab === 'guest_bookings'
                  ? 'bg-[#0F2C59] text-white shadow-xs'
                  : 'text-slate-700 hover:text-[#0F2C59] hover:bg-slate-100'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>My Reservations</span>
              {myGuestBookingsCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'guest_bookings' ? 'bg-amber-400 text-slate-900' : 'bg-slate-200 text-slate-800'
                }`}>
                  {myGuestBookingsCount}
                </span>
              )}
            </button>

            {/* Staff / Front Desk tab (Accessible to staff, manager, admin) */}
            {['staff', 'manager', 'admin'].includes(currentUser.role) && (
              <button
                onClick={() => onSelectTab('staff_desk')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 relative ${
                  activeTab === 'staff_desk'
                    ? 'bg-[#0F2C59] text-white shadow-xs'
                    : 'text-slate-700 hover:text-[#0F2C59] hover:bg-slate-100'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span>Front Desk Ops</span>
                {pendingStaffTasks > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-500 text-white animate-pulse">
                    {pendingStaffTasks}
                  </span>
                )}
              </button>
            )}

            {/* Manager Operations & Revenue (Accessible to manager, admin) */}
            {['manager', 'admin'].includes(currentUser.role) && (
              <button
                onClick={() => onSelectTab('manager_ops')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'manager_ops'
                    ? 'bg-[#0F2C59] text-white shadow-xs'
                    : 'text-slate-700 hover:text-[#0F2C59] hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Manager Analytics</span>
              </button>
            )}

            {/* Admin Center (Accessible to admin only) */}
            {currentUser.role === 'admin' && (
              <button
                onClick={() => onSelectTab('admin_center')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'admin_center'
                    ? 'bg-[#0F2C59] text-white shadow-xs'
                    : 'text-slate-700 hover:text-[#0F2C59] hover:bg-slate-100'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Admin Center</span>
              </button>
            )}
          </nav>

          {/* User Profile & Quick Switch Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSignIn}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-100 border border-slate-200 transition text-left"
              title="Click to sign in or switch profile"
            >
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80'}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-amber-300"
              />
              <div className="hidden sm:block leading-tight">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <span>{currentUser.name}</span>
                </div>
                <div className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider">
                  {currentUser.role}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center justify-around py-2.5 border-t border-slate-100 overflow-x-auto gap-2">
          <button
            onClick={() => onSelectTab('explore')}
            className={`px-2 py-1 text-xs font-semibold rounded ${activeTab === 'explore' ? 'bg-[#0F2C59] text-white' : 'text-slate-600'}`}
          >
            Explore
          </button>
          <button
            onClick={() => onSelectTab('guest_bookings')}
            className={`px-2 py-1 text-xs font-semibold rounded ${activeTab === 'guest_bookings' ? 'bg-[#0F2C59] text-white' : 'text-slate-600'}`}
          >
            Reservations ({myGuestBookingsCount})
          </button>
          {['staff', 'manager', 'admin'].includes(currentUser.role) && (
            <button
              onClick={() => onSelectTab('staff_desk')}
              className={`px-2 py-1 text-xs font-semibold rounded ${activeTab === 'staff_desk' ? 'bg-[#0F2C59] text-white' : 'text-slate-600'}`}
            >
              Front Desk
            </button>
          )}
          {['manager', 'admin'].includes(currentUser.role) && (
            <button
              onClick={() => onSelectTab('manager_ops')}
              className={`px-2 py-1 text-xs font-semibold rounded ${activeTab === 'manager_ops' ? 'bg-[#0F2C59] text-white' : 'text-slate-600'}`}
            >
              Manager
            </button>
          )}
          {currentUser.role === 'admin' && (
            <button
              onClick={() => onSelectTab('admin_center')}
              className={`px-2 py-1 text-xs font-semibold rounded ${activeTab === 'admin_center' ? 'bg-[#0F2C59] text-white' : 'text-slate-600'}`}
            >
              Admin
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
