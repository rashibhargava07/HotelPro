import React from 'react';
import { useHotelProStore } from '../../hooks/useHotelProStore';
import { Shield, Briefcase, Bell, UserCheck, RotateCcw, Building2 } from 'lucide-react';
import { UserRole } from '../../types';

interface PersonaBannerProps {
  onOpenDocs: () => void;
}

export const PersonaBanner: React.FC<PersonaBannerProps> = ({ onOpenDocs }) => {
  const { currentUser, users, hotels, activeHotel, actions } = useHotelProStore();

  const roleConfig: Record<UserRole, { label: string; icon: any; color: string; bg: string }> = {
    admin: { label: 'Admin Mode', icon: Shield, color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
    manager: { label: 'Manager Mode', icon: Briefcase, color: 'text-amber-800', bg: 'bg-amber-50 border-amber-200' },
    staff: { label: 'Front Desk / Staff', icon: Bell, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
    guest: { label: 'Guest Persona', icon: UserCheck, color: 'text-emerald-800', bg: 'bg-emerald-50 border-emerald-200' },
  };

  const currentConfig = roleConfig[currentUser.role];
  const CurrentIcon = currentConfig.icon;

  const handleSelectUser = (userEmail: string) => {
    const selected = users.find((u) => u.email === userEmail);
    if (selected) {
      actions.setCurrentUser(selected);
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 text-xs border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 shadow-inner">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-semibold text-amber-400 tracking-wide uppercase flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Simulated Persona:
        </span>

        {/* Quick 1-click role buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {users.map((u) => {
            const isCurrent = u.id === currentUser.id;
            return (
              <button
                key={u.id}
                onClick={() => actions.setCurrentUser(u)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                }`}
                title={`Switch to ${u.name} (${u.role})`}
              >
                <span>{u.role === 'admin' ? '👑' : u.role === 'manager' ? '💼' : u.role === 'staff' ? '🛎️' : '🧳'}</span>
                <span>{u.name.split(' ')[0]}</span>
                <span className="text-[10px] opacity-75 capitalize">({u.role})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {/* Hotel Selector for Managers / Admins */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
          <Building2 className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">Hotel:</span>
          <select
            value={activeHotel.id}
            onChange={(e) => actions.setActiveHotelId(e.target.value)}
            className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
          >
            {hotels.map((h) => (
              <option key={h.id} value={h.id} className="bg-slate-900 text-white">
                {h.name} ({h.city})
              </option>
            ))}
          </select>
        </div>

        {/* View Specs & Code Button */}
        <button
          onClick={onOpenDocs}
          className="text-amber-300 hover:text-amber-200 underline decoration-amber-400/50 hover:decoration-amber-300 font-medium flex items-center gap-1 transition"
        >
          <span>System Specs & Monorepo</span>
        </button>

        {/* Reset Store */}
        <button
          onClick={() => {
            if (confirm('Reset all bookings, housekeeping tasks, and room statuses to initial clean seed state?')) {
              actions.resetAll();
            }
          }}
          className="text-slate-400 hover:text-rose-300 transition flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-800"
          title="Reset database to seed state"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Seed</span>
        </button>
      </div>
    </div>
  );
};
