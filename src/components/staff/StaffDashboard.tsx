import React, { useState, useMemo } from 'react';
import { useHotelProStore } from '../../hooks/useHotelProStore';
import { Booking, HousekeepingTask, ServiceRequest } from '../../types';
import {
  LogIn,
  LogOut,
  Sparkles,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  BedDouble,
  UserCheck,
  Phone,
  Mail,
  ShieldAlert,
  Flame,
  ArrowRight,
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const { currentUser, bookings, rooms, housekeepingTasks, serviceRequests, activeHotel, actions } = useHotelProStore();

  const [activeTab, setActiveTab] = useState<'arrivals' | 'departures' | 'housekeeping' | 'concierge'>('arrivals');
  const [searchTerm, setSearchTerm] = useState('');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter bookings for active hotel
  const hotelBookings = useMemo(() => {
    return bookings.filter((b) => b.hotelId === activeHotel.id);
  }, [bookings, activeHotel.id]);

  // Arrivals: Bookings confirmed with checkIn <= today
  const arrivals = useMemo(() => {
    return hotelBookings
      .filter((b) => b.bookingStatus === 'confirmed')
      .filter((b) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          b.bookingReference.toLowerCase().includes(term) ||
          b.guestDetailsSnapshot.name.toLowerCase().includes(term) ||
          b.roomDetailsSnapshot.roomNumber.toLowerCase().includes(term)
        );
      });
  }, [hotelBookings, searchTerm]);

  // Departures: Bookings currently checked_in
  const departures = useMemo(() => {
    return hotelBookings
      .filter((b) => b.bookingStatus === 'checked_in')
      .filter((b) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          b.bookingReference.toLowerCase().includes(term) ||
          b.guestDetailsSnapshot.name.toLowerCase().includes(term) ||
          b.roomDetailsSnapshot.roomNumber.toLowerCase().includes(term)
        );
      });
  }, [hotelBookings, searchTerm]);

  // Housekeeping tasks for active hotel
  const hotelHKTasks = useMemo(() => {
    return housekeepingTasks.filter((t) => t.hotelId === activeHotel.id);
  }, [housekeepingTasks, activeHotel.id]);

  // Service requests for active hotel
  const hotelServiceReqs = useMemo(() => {
    return serviceRequests.filter((r) => r.hotelId === activeHotel.id);
  }, [serviceRequests, activeHotel.id]);

  const handleCheckIn = (bookingId: string) => {
    try {
      actions.checkInGuest(bookingId);
    } catch (err: any) {
      alert(err.message || 'Check-in error');
    }
  };

  const handleCheckOut = (bookingId: string) => {
    try {
      actions.checkOutGuest(bookingId);
    } catch (err: any) {
      alert(err.message || 'Check-out error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold uppercase tracking-wider mb-2">
            <UserCheck className="w-3.5 h-3.5 text-blue-700" />
            <span>Front Desk & Property Operations</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#0F2C59]">
            {activeHotel.name} Front Desk
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Logged in as <span className="font-semibold text-slate-900">{currentUser.name} ({currentUser.role})</span>. Real-time arrivals, automated checkout turnaround, and guest service tickets.
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search guest, ref, room..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0F2C59]"
          />
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <LogIn className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-bold font-serif text-[#0F2C59]">{arrivals.length}</span>
            <span className="text-xs text-slate-500 block">Pending Arrivals</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <LogOut className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-bold font-serif text-[#0F2C59]">{departures.length}</span>
            <span className="text-xs text-slate-500 block">Active In-Stay</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-bold font-serif text-[#0F2C59]">
              {hotelHKTasks.filter((t) => t.status !== 'completed').length}
            </span>
            <span className="text-xs text-slate-500 block">Housekeeping Tasks</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-bold font-serif text-[#0F2C59]">
              {hotelServiceReqs.filter((s) => s.status === 'open').length}
            </span>
            <span className="text-xs text-slate-500 block">Open Concierge Tickets</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto">
        {[
          { id: 'arrivals', label: `Expected Arrivals (${arrivals.length})`, icon: LogIn },
          { id: 'departures', label: `Departures & In-Stay (${departures.length})`, icon: LogOut },
          { id: 'housekeeping', label: `Housekeeping Board (${hotelHKTasks.length})`, icon: Sparkles },
          { id: 'concierge', label: `Concierge Tickets (${hotelServiceReqs.length})`, icon: ClipboardCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#0F2C59] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Expected Arrivals */}
      {activeTab === 'arrivals' && (
        <div className="space-y-4">
          {arrivals.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              No pending arrivals found for current filter.
            </div>
          ) : (
            arrivals.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-800 flex flex-col items-center justify-center font-bold">
                    <span className="text-[10px] uppercase">Room</span>
                    <span className="text-base font-serif">{b.roomDetailsSnapshot.roomNumber}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">
                        {b.guestDetailsSnapshot.name}
                      </h4>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {b.bookingReference}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Paid ₹{b.priceBreakdown.totalAmount.toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1">
                      {b.roomDetailsSnapshot.categoryName} • {b.numberOfAdults} Adults • Dates: {b.checkIn} to {b.checkOut} ({b.priceBreakdown.nights} nights)
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-500" />
                        {b.guestDetailsSnapshot.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-500" />
                        {b.guestDetailsSnapshot.email}
                      </span>
                    </div>

                    {b.guestDetailsSnapshot.specialRequests && (
                      <p className="text-xs text-amber-800 bg-amber-50 px-2 py-1 rounded-md mt-2 border border-amber-200/60 inline-block">
                        <strong>Request:</strong> {b.guestDetailsSnapshot.specialRequests}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleCheckIn(b.id)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Check-In Guest & Issue Keys</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Departures & In-Stay */}
      {activeTab === 'departures' && (
        <div className="space-y-4">
          {departures.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              No currently checked-in guests found.
            </div>
          ) : (
            departures.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex flex-col items-center justify-center font-bold">
                    <span className="text-[10px] uppercase">Room</span>
                    <span className="text-base font-serif">{b.roomDetailsSnapshot.roomNumber}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">
                        {b.guestDetailsSnapshot.name}
                      </h4>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {b.bookingReference}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        Checked-In
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1">
                      {b.roomDetailsSnapshot.categoryName} • Checked In at:{' '}
                      {b.checkInRecord ? new Date(b.checkInRecord.checkedInAt).toLocaleTimeString() : 'Earlier'}
                    </p>

                    <div className="text-xs text-slate-400 mt-1">
                      Scheduled Departure: {b.checkOut} by 11:00 AM
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleCheckOut(b.id)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0F2C59] hover:bg-[#081a36] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-amber-300" />
                    <span>Check-Out Guest (Auto-Flags Dirty)</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Housekeeping Board */}
      {activeTab === 'housekeeping' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl text-xs text-slate-600">
            <span>
              Turnaround Workflow: Marking a room dirty dispatches a turnaround task. Completing it certifies the room ready for check-in.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['pending', 'in_progress', 'completed'].map((statusKey) => {
              const tasks = hotelHKTasks.filter((t) => t.status === statusKey);
              return (
                <div key={statusKey} className="bg-slate-100/70 rounded-2xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 capitalize">
                      {statusKey.replace('_', ' ')} ({tasks.length})
                    </h4>
                  </div>

                  <div className="space-y-3">
                    {tasks.map((t) => (
                      <div
                        key={t.id}
                        className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 font-serif text-sm">
                            Room {t.roomNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                              t.priority === 'urgent'
                                ? 'bg-rose-100 text-rose-800'
                                : t.priority === 'high'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {t.priority}
                          </span>
                        </div>

                        <div className="text-slate-600 font-medium">
                          {t.taskType.replace('_', ' ').toUpperCase()}
                        </div>
                        {t.notes && <p className="text-slate-500 text-[11px]">{t.notes}</p>}

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">
                            {t.assignedStaffName || 'Unassigned'}
                          </span>

                          {statusKey === 'pending' && (
                            <button
                              onClick={() => actions.updateHousekeepingTask(t.id, 'in_progress', currentUser.id, currentUser.name)}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-[10px]"
                            >
                              Start Clean
                            </button>
                          )}

                          {statusKey === 'in_progress' && (
                            <button
                              onClick={() => actions.updateHousekeepingTask(t.id, 'completed', currentUser.id, currentUser.name, 'Cleaned and sanitized')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px]"
                            >
                              Mark Inspected
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Concierge & In-Stay Requests */}
      {activeTab === 'concierge' && (
        <div className="space-y-4">
          {hotelServiceReqs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              No open concierge requests at this time.
            </div>
          ) : (
            hotelServiceReqs.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-[#0F2C59]">Room {req.roomNumber}</span>
                    <span className="text-xs text-slate-500 font-semibold">• {req.guestName}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900 capitalize">
                      {req.category.replace('_', ' ')}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        req.priority === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {req.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800">{req.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  {req.status === 'open' && (
                    <button
                      onClick={() => actions.updateServiceRequestStatus(req.id, 'assigned', currentUser.id, currentUser.name)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs"
                    >
                      Accept Ticket
                    </button>
                  )}
                  {req.status === 'assigned' && (
                    <button
                      onClick={() => actions.updateServiceRequestStatus(req.id, 'resolved', currentUser.id, currentUser.name)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                    >
                      Mark Resolved
                    </button>
                  )}
                  {req.status === 'resolved' && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
