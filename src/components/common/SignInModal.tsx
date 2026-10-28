import React, { useState } from 'react';
import { useHotelProStore } from '../../hooks/useHotelProStore';
import { X, Crown, Shield, Briefcase, Bell, UserCheck, ArrowRight, Sparkles } from 'lucide-react';
import { UserRole } from '../../types';

interface SignInModalProps {
  onClose: () => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({ onClose }) => {
  const { users, currentUser, actions } = useHotelProStore();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSelectPredefined = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      actions.setCurrentUser(user);
      onClose();
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    actions.registerUser(name.trim(), email.trim(), 'guest', phone.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#0F2C59] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-300 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center mb-3">
            <Crown className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-serif font-bold text-white">
            {isRegisterMode ? 'Register New Guest Profile' : 'Select System Persona'}
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            {isRegisterMode
              ? 'Create a customized guest profile to experience luxury bookings'
              : 'Switch personas instantly to test RBAC roles across the hotel system'}
          </p>
        </div>

        <div className="p-6">
          {!isRegisterMode ? (
            <div className="space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Pre-Configured Demo Accounts (1-Click Switch)
              </span>

              <div className="space-y-2.5">
                {users.map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  const icons: Record<UserRole, any> = {
                    admin: Shield,
                    manager: Briefcase,
                    staff: Bell,
                    guest: UserCheck,
                  };
                  const Icon = icons[u.role] || UserCheck;

                  return (
                    <button
                      key={u.id}
                      onClick={() => handleSelectPredefined(u.id)}
                      className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between group ${
                        isCurrent
                          ? 'border-[#0F2C59] bg-[#0F2C59]/5 ring-1 ring-[#0F2C59]'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatarUrl}
                          alt={u.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-[#0F2C59]">
                            {u.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'manager'
                              ? 'bg-amber-100 text-amber-900'
                              : u.role === 'staff'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {u.role}
                        </span>
                        {isCurrent && (
                          <span className="block text-[9px] text-[#0F2C59] font-bold mt-1">
                            Current Active
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100 text-center">
                <button
                  onClick={() => setIsRegisterMode(true)}
                  className="text-xs text-[#0F2C59] font-bold hover:underline"
                >
                  Or register a custom guest account →
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maharani Gayatri Devi"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(false)}
                  className="text-slate-500 font-semibold hover:underline"
                >
                  ← Back to Personas
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0F2C59] text-white font-bold"
                >
                  Start Booking Experience
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
