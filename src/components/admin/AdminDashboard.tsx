import React, { useState } from 'react';
import { useHotelProStore } from '../../hooks/useHotelProStore';
import { User, Hotel, UserRole } from '../../types';
import {
  Shield,
  Users,
  Building2,
  FileText,
  UserPlus,
  PlusCircle,
  CheckCircle2,
  Key,
  Activity,
  MapPin,
  Calendar,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { users, hotels, bookings, auditLogs, actions } = useHotelProStore();

  const [activeTab, setActiveTab] = useState<'users' | 'hotels' | 'audit'>('users');

  // Add User State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('staff');
  const [newUserPhone, setNewUserPhone] = useState('');

  // Add Hotel State
  const [showAddHotelModal, setShowAddHotelModal] = useState(false);
  const [newHotelName, setNewHotelName] = useState('');
  const [newHotelCity, setNewHotelCity] = useState('');
  const [newHotelState, setNewHotelState] = useState('');
  const [newHotelDesc, setNewHotelDesc] = useState('');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    actions.registerUser(newUserName.trim(), newUserEmail.trim(), newUserRole, newUserPhone.trim());
    setShowAddUserModal(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
  };

  const handleCreateHotel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHotelName.trim() || !newHotelCity.trim()) return;

    const newHotel: Hotel = {
      id: `hotel_${Date.now()}`,
      name: newHotelName.trim(),
      slug: newHotelName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      description: newHotelDesc.trim() || 'A premier boutique luxury escape offering world-class hospitality.',
      address: 'Central Heritage Boulevard',
      city: newHotelCity.trim(),
      state: newHotelState.trim() || 'India',
      country: 'India',
      postalCode: '110001',
      contactDetails: {
        phone: '+91 11 2345 6789',
        email: `concierge@${newHotelName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      },
      timeZone: 'Asia/Kolkata',
      checkInTime: '14:00',
      checkOutTime: '11:00',
      amenities: ['Infinity Pool', 'Luxury Spa', '24/7 Butler Service', 'Fine Dining', 'High-Speed Wi-Fi'],
      images: [
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80'
      ],
      policies: {
        cancellation: 'Free cancellation up to 48 hours prior to check-in.',
        petsAllowed: true,
      },
      publicationStatus: 'published',
      managerIds: [],
      rating: 4.85,
      reviewCount: 42,
    };

    actions.saveHotel(newHotel);
    setShowAddHotelModal(false);
    setNewHotelName('');
    setNewHotelCity('');
    setNewHotelState('');
    setNewHotelDesc('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5 text-purple-700" />
            <span>Platform Administration & Governance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#0F2C59]">
            System Administration Center
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Global access control (RBAC), multi-property provisioning, and immutable system audit ledger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddUserModal(true)}
            className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
          </button>

          <button
            onClick={() => setShowAddHotelModal(true)}
            className="px-4 py-2 rounded-xl bg-[#0F2C59] hover:bg-[#081a36] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Hotel</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-8">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'users' ? 'bg-[#0F2C59] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users & RBAC ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('hotels')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'hotels' ? 'bg-[#0F2C59] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Properties Portfolio ({hotels.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'audit' ? 'bg-[#0F2C59] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>System Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-[#0F2C59]">System Users & Role Grants</h3>
            <span className="text-xs text-slate-500">
              Role changes immediately update access permissions across all views.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-6">User Profile</th>
                  <th className="py-3 px-6">Email Address</th>
                  <th className="py-3 px-6">Assigned Role</th>
                  <th className="py-3 px-6">Account Status</th>
                  <th className="py-3 px-6 text-right">Role Modifier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-6 font-semibold text-slate-900 flex items-center gap-3">
                      <img
                        src={u.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80'}
                        alt={u.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3.5 px-6 font-mono text-slate-600">{u.email}</td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'manager'
                            ? 'bg-amber-100 text-amber-900'
                            : u.role === 'staff'
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => actions.updateUserRole(u.id, e.target.value as UserRole)}
                        className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0F2C59]"
                      >
                        <option value="guest">Guest</option>
                        <option value="staff">Staff</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Hotels Tab */}
      {activeTab === 'hotels' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hotels.map((h) => (
            <div key={h.id} className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="h-48 overflow-hidden bg-slate-800 relative">
                <img src={h.images[0]} alt={h.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-[#0F2C59] text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                  {h.publicationStatus.toUpperCase()}
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-serif font-bold text-xl text-[#0F2C59]">{h.name}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>{h.city}, {h.state}, {h.country}</span>
                </p>
                <p className="text-xs text-slate-600 mt-3 line-clamp-2">{h.description}</p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Rating: ★ {h.rating} ({h.reviewCount} reviews)</span>
                  <button
                    onClick={() => actions.setActiveHotelId(h.id)}
                    className="font-bold text-[#0F2C59] hover:underline"
                  >
                    Set Active Hotel
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-[#0F2C59]">Immutable System Activity Log</h3>
            <span className="text-xs text-slate-400">Total events recorded: {auditLogs.length}</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                      {log.action}
                    </span>
                    <span className="font-bold text-slate-800">
                      {log.performedBy.name} ({log.performedBy.role})
                    </span>
                  </div>
                  <p className="text-slate-600">{log.details}</p>
                </div>
                <div className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-xl font-serif font-bold text-[#0F2C59] mb-4">Add System Account</h3>
            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Siddharth Verma"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="siddharth@hotelpro.com"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Role Permission</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                >
                  <option value="guest">Guest</option>
                  <option value="staff">Staff (Front Desk & Housekeeping)</option>
                  <option value="manager">Manager (Property Operations)</option>
                  <option value="admin">Administrator (Platform Superadmin)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Hotel Modal */}
      {showAddHotelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-xl font-serif font-bold text-[#0F2C59] mb-4">Provision Hotel Sanctuary</h3>
            <form onSubmit={handleCreateHotel} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Hotel Property Name</label>
                <input
                  type="text"
                  required
                  value={newHotelName}
                  onChange={(e) => setNewHotelName(e.target.value)}
                  placeholder="e.g. Royal Nilgiri Retreat & Wellness"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newHotelCity}
                    onChange={(e) => setNewHotelCity(e.target.value)}
                    placeholder="Ooty"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={newHotelState}
                    onChange={(e) => setNewHotelState(e.target.value)}
                    placeholder="Tamil Nadu"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newHotelDesc}
                  onChange={(e) => setNewHotelDesc(e.target.value)}
                  placeholder="Serene mountain sanctuary surrounded by tea plantations..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddHotelModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F2C59] text-white font-bold"
                >
                  Register Hotel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
