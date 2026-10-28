import React, { useState, useMemo } from 'react';
import { useHotelProStore } from '../../hooks/useHotelProStore';
import { Room, HousekeepingStatus, OperationalStatus } from '../../types';
import {
  TrendingUp,
  DollarSign,
  Bed,
  CheckCircle,
  AlertCircle,
  Sparkles,
  BarChart,
  Layers,
  Edit3,
  Save,
  Clock,
  ShieldCheck,
  Building2,
} from 'lucide-react';

export const ManagerDashboard: React.FC = () => {
  const { activeHotel, categories, rooms, bookings, payments, actions } = useHotelProStore();

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<number>(0);
  const [selectedRoomForStatus, setSelectedRoomForStatus] = useState<Room | null>(null);

  // Active hotel rooms
  const hotelRooms = useMemo(() => {
    return rooms.filter((r) => r.hotelId === activeHotel.id);
  }, [rooms, activeHotel.id]);

  // Active hotel bookings
  const hotelBookings = useMemo(() => {
    return bookings.filter((b) => b.hotelId === activeHotel.id);
  }, [bookings, activeHotel.id]);

  // Metrics
  const totalRoomsCount = hotelRooms.length || 1;
  const occupiedRoomsCount = hotelBookings.filter((b) => b.bookingStatus === 'checked_in').length;
  const occupancyRate = Math.round((occupiedRoomsCount / totalRoomsCount) * 100);

  // Captured revenue
  const totalRevenue = hotelBookings
    .filter((b) => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + b.priceBreakdown.totalAmount, 0);

  const adr = occupiedRoomsCount > 0 ? Math.round(totalRevenue / occupiedRoomsCount) : 11500;
  const revPar = Math.round((adr * occupancyRate) / 100);

  const cleanRoomsCount = hotelRooms.filter((r) => r.housekeepingStatus === 'clean' || r.housekeepingStatus === 'inspected').length;
  const dirtyRoomsCount = hotelRooms.filter((r) => r.housekeepingStatus === 'dirty' || r.housekeepingStatus === 'cleaning_in_progress').length;

  const handleStartEditPrice = (catId: string, currentPrice: number) => {
    setEditingCategoryId(catId);
    setEditingPrice(currentPrice);
  };

  const handleSavePrice = (catId: string) => {
    if (editingPrice > 0) {
      actions.updateRoomCategoryPrice(catId, editingPrice);
    }
    setEditingCategoryId(null);
  };

  const handleQuickStatusChange = (roomId: string, hkStatus: HousekeepingStatus, opsStatus: OperationalStatus) => {
    actions.updateRoomStatus(roomId, hkStatus, opsStatus);
    setSelectedRoomForStatus(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5 text-amber-700" />
            <span>General Manager Operations & Yield Analytics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#0F2C59]">
            {activeHotel.name}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time occupancy performance, revenue analytics, physical room inventory status, and dynamic rate management.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Occupancy Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-serif font-bold text-[#0F2C59]">
            {occupancyRate}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {occupiedRoomsCount} of {totalRoomsCount} chambers currently occupied
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Captured Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-serif font-bold text-[#0F2C59]">
            ₹{totalRevenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-700 mt-1 font-semibold">
            Razorpay verified & GST calculated
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>ADR (Avg Daily Rate)</span>
            <BarChart className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-serif font-bold text-[#0F2C59]">
            ₹{adr.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Weekend markups active (+15%)
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Ready Chambers</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-serif font-bold text-emerald-700">
            {cleanRoomsCount} / {totalRoomsCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {dirtyRoomsCount} in turnaround / cleaning
          </p>
        </div>
      </div>

      {/* Room Inventory & Operational Status Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-xl font-serif font-bold text-[#0F2C59] flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-600" />
              <span>Chamber Operational & Housekeeping Matrix</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any room chamber to update operational or housekeeping state.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs flex-wrap">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Clean / Inspected
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Cleaning in Progress
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Dirty
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Maintenance
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {hotelRooms.map((room) => {
            const cat = categories.find((c) => c.id === room.categoryId);
            const isClean = room.housekeepingStatus === 'clean' || room.housekeepingStatus === 'inspected';
            const isDirty = room.housekeepingStatus === 'dirty';
            const isCleaning = room.housekeepingStatus === 'cleaning_in_progress';
            const isMaintenance = room.operationalStatus !== 'available';

            return (
              <div
                key={room.id}
                onClick={() => setSelectedRoomForStatus(room)}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition hover:scale-105 shadow-xs relative ${
                  isMaintenance
                    ? 'bg-slate-100 border-slate-300'
                    : isDirty
                    ? 'bg-rose-50/60 border-rose-200'
                    : isCleaning
                    ? 'bg-amber-50/60 border-amber-200'
                    : 'bg-emerald-50/60 border-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-serif font-bold text-slate-900">
                    Room {room.roomNumber}
                  </span>
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isMaintenance
                        ? 'bg-slate-400'
                        : isDirty
                        ? 'bg-rose-500'
                        : isCleaning
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                </div>

                <div className="text-[11px] font-semibold text-slate-700 truncate mt-1">
                  {cat?.name || 'Standard'}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                  <span className="uppercase font-bold tracking-wider text-slate-500">
                    {room.housekeepingStatus.replace('_', ' ')}
                  </span>
                  <span className="font-mono text-slate-600">₹{room.basePrice.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Rate & Pricing Rule Management */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <h3 className="text-xl font-serif font-bold text-[#0F2C59] mb-2">
          Category Base Rate & Yield Management
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Adjust nightly base rates for categories. Weekend surcharges (15%) and 12% GST are dynamically calculated automatically.
        </p>

        <div className="space-y-4">
          {categories
            .filter((c) => c.hotelId === activeHotel.id)
            .map((cat) => (
              <div
                key={cat.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <h4 className="font-bold text-sm text-[#0F2C59]">{cat.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {cat.bedConfiguration} • Capacity: {cat.capacity.adults} Adults, {cat.capacity.children} Children
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {editingCategoryId === cat.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600">₹</span>
                      <input
                        type="number"
                        value={editingPrice}
                        onChange={(e) => setEditingPrice(Number(e.target.value))}
                        className="w-28 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-[#0F2C59]"
                      />
                      <button
                        onClick={() => handleSavePrice(cat.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-xs text-slate-400 block text-right">Nightly Base Rate</span>
                        <span className="text-lg font-serif font-bold text-[#0F2C59]">
                          ₹{cat.basePrice.toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleStartEditPrice(cat.id, cat.basePrice)}
                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#0F2C59] hover:bg-slate-100 transition"
                        title="Edit Base Price"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Quick Room Status Modal */}
      {selectedRoomForStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-serif font-bold text-[#0F2C59] mb-1">
              Room {selectedRoomForStatus.roomNumber} Status
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select new operational or housekeeping readiness:
            </p>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => handleQuickStatusChange(selectedRoomForStatus.id, 'clean', 'available')}
                className="w-full p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold hover:bg-emerald-100 transition text-left flex items-center justify-between"
              >
                <span>Clean & Ready for Guest</span>
                <span className="text-[10px] uppercase">Available</span>
              </button>

              <button
                onClick={() => handleQuickStatusChange(selectedRoomForStatus.id, 'inspected', 'available')}
                className="w-full p-2.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 font-bold hover:bg-blue-100 transition text-left flex items-center justify-between"
              >
                <span>Inspected & Certified</span>
                <span className="text-[10px] uppercase">VIP Ready</span>
              </button>

              <button
                onClick={() => handleQuickStatusChange(selectedRoomForStatus.id, 'dirty', 'available')}
                className="w-full p-2.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 font-bold hover:bg-rose-100 transition text-left flex items-center justify-between"
              >
                <span>Dirty / Needs Cleaning</span>
                <span className="text-[10px] uppercase">Pending Turnaround</span>
              </button>

              <button
                onClick={() => handleQuickStatusChange(selectedRoomForStatus.id, 'dirty', 'maintenance')}
                className="w-full p-2.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 font-bold hover:bg-slate-200 transition text-left flex items-center justify-between"
              >
                <span>Out of Service / Maintenance</span>
                <span className="text-[10px] uppercase">Blocked</span>
              </button>
            </div>

            <button
              onClick={() => setSelectedRoomForStatus(null)}
              className="mt-4 w-full py-2 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
