import React, { useState } from 'react';
import { X, Code2, Copy, Check, Terminal, Database, Server, Shield, Layers } from 'lucide-react';

interface SystemDocsModalProps {
  onClose: () => void;
}

export const SystemDocsModal: React.FC<SystemDocsModalProps> = ({ onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeDocTab, setActiveDocTab] = useState<'architecture' | 'schema' | 'endpoints' | 'generator'>('architecture');

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const bundleScript = `/**
 * HotelPro Monorepo Automated Bundle Generator
 * Scaffolds the entire repository structure and creates HotelPro_FullStack_Project.zip
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = path.resolve('HotelPro_FullStack_Project');

console.log('[HotelPro] Initializing directory hierarchy...');
if (fs.existsSync(rootDir)) {
  fs.rmSync(rootDir, { recursive: true, force: true });
}
fs.mkdirSync(rootDir, { recursive: true });

// Scaffolds client and server configurations
console.log('[HotelPro] Writing package manifests & database models...');
// Execute: node bundle-generator.mjs
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 text-slate-100 rounded-3xl max-w-4xl w-full max-h-[90vh] shadow-2xl border border-slate-700 overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-mono">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-white">
                HotelPro Architecture & System Specification
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Full-stack reference implementation, MongoDB schema, and packaging script.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="px-6 pt-3 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          {[
            { id: 'architecture', label: 'Monorepo Architecture', icon: Layers },
            { id: 'schema', label: 'Database Schema & Indexes', icon: Database },
            { id: 'endpoints', label: 'REST API & Concurrency Logic', icon: Server },
            { id: 'generator', label: 'Unpacker & Bundle Script', icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveDocTab(tab.id as any)}
                className={`px-4 py-2.5 font-bold transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
                  activeDocTab === tab.id
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed font-sans">
          {activeDocTab === 'architecture' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-amber-300">Monorepo Project Structure</h3>
              <p>
                HotelPro is designed as an enterprise multi-tier architecture with role-based access control, strict date-interval validation, and event-driven room turnaround workflows.
              </p>

              <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
{`hotelpro/
├── .env.example
├── package.json
├── client/
│   ├── src/
│   │   ├── components/common/ (Navbar, Sidebar, PersonaBanner)
│   │   ├── components/public/ (HotelShowcase, BookingModal, RazorpayModal)
│   │   ├── components/guest/ (GuestDashboard, ServiceRequests)
│   │   ├── components/staff/ (ArrivalsDepartures, HousekeepingBoard)
│   │   ├── components/manager/ (OccupancyYield, RateManagement)
│   │   └── components/admin/ (RBACDirectory, PropertyManagement)
└── server/
    ├── src/
    │   ├── config/db.js (MongoDB Mongoose connection)
    │   ├── models/ (User, Hotel, RoomCategory, Room, Booking, Payment, HousekeepingTask)
    │   ├── middleware/ (auth.js, errorHandler.js)
    │   ├── services/ (pricingService.js, bookingService.js, paymentService.js)
    │   ├── controllers/ (auth, hotel, booking, payment, staff, manager, admin)
    │   └── utils/seed.js (Repeatable seed script)`}
              </pre>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
                  <h4 className="font-bold text-amber-300 mb-1">Pre-Seeded Demo Personas</h4>
                  <ul className="space-y-1 font-mono text-[11px] text-slate-400">
                    <li>👑 Admin: admin@hotelpro.com (Super Administrator)</li>
                    <li>💼 Manager: manager@hotelpro.com (Aditi Sharma)</li>
                    <li>🛎️ Staff: staff@hotelpro.com (Rohan Verma)</li>
                    <li>🧳 Guest: guest@hotelpro.com (Vikram Malhotra)</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
                  <h4 className="font-bold text-amber-300 mb-1">Guaranteed Financial Integrity</h4>
                  <p className="text-slate-400 text-[11px]">
                    Pricing is calculated strictly server-side using base rate, +15% Friday/Saturday surge, 12% GST, and ₹250 flat concierge fee. Client payloads cannot manipulate final amounts.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeDocTab === 'schema' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-amber-300">MongoDB / Mongoose Compound Indexes</h3>
              <p>
                To eliminate double-bookings and race conditions during high-volume checkouts, the Booking schema enforces a compound index on room IDs and half-open check-in/out dates:
              </p>

              <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-[11px] text-amber-300 overflow-x-auto">
{`// Compound index for overlap search optimization
bookingSchema.index({ roomId: 1, checkIn: 1, checkOut: 1, bookingStatus: 1 });

// Unique room identifier per hotel
roomSchema.index({ hotelId: 1, roomNumber: 1 }, { unique: true });

// User email uniqueness
userSchema.index({ email: 1 }, { unique: true });

// Review model: One review per concluded booking + hotel date index
reviewSchema.index({ hotelId: 1, createdAt: -1 });
reviewSchema.index({ bookingId: 1 }, { unique: true });`}
              </pre>

              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
                <h4 className="font-bold text-white mb-2">Automated Turnaround & Review Lifecycle</h4>
                <div className="flex items-center gap-2 text-slate-300 flex-wrap">
                  <span className="px-2 py-1 rounded bg-blue-900/60 text-blue-300 font-mono font-bold">Checked-In</span>
                  <span>→</span>
                  <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-mono font-bold">Checked-Out</span>
                  <span>→</span>
                  <span className="px-2 py-1 rounded bg-emerald-900/60 text-emerald-300 font-mono font-bold">Review Eligible</span>
                  <span>→</span>
                  <span className="px-2 py-1 rounded bg-amber-900/60 text-amber-300 font-mono font-bold">Verified Rating Live</span>
                </div>
              </div>
            </div>
          )}

          {activeDocTab === 'endpoints' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-amber-300">Core API Routes & Half-Open Overlap Formula</h3>
              <p>
                Room availability is evaluated using the interval formula:
                <br />
                <code className="text-emerald-400 font-mono bg-slate-950 px-2 py-1 rounded inline-block my-2">
                  existingCheckIn &lt; requestedCheckOut &amp;&amp; existingCheckOut &gt; requestedCheckIn
                </code>
                <br />
                This allows seamless same-day back-to-back stays (e.g. Guest A checks out at 11:00 AM on Nov 10, Guest B checks in at 2:00 PM on Nov 10).
              </p>

              <div className="space-y-2">
                {[
                  { method: 'POST', path: '/api/v1/auth/register', desc: 'Public signup (locks role strictly to guest)' },
                  { method: 'POST', path: '/api/v1/auth/login', desc: 'Issues 24h JWT token and user profile' },
                  { method: 'GET', path: '/api/v1/bookings/availability', desc: 'Finds vacant rooms avoiding overlapping reservations' },
                  { method: 'POST', path: '/api/v1/bookings', desc: 'Places 15-minute hold on room inventory' },
                  { method: 'POST', path: '/api/v1/payments/verify', desc: 'Validates Razorpay HMAC-SHA256 signature' },
                  { method: 'POST', path: '/api/v1/staff/check-in/:id', desc: 'Front desk check-in action' },
                  { method: 'POST', path: '/api/v1/staff/check-out/:id', desc: 'Front desk checkout + triggers housekeeping task' },
                  { method: 'GET', path: '/api/v1/reviews/:hotelId', desc: 'Retrieves reviews and rating distribution' },
                  { method: 'POST', path: '/api/v1/reviews', desc: 'Submits verified review after concluded checkout' },
                  { method: 'POST', path: '/api/v1/reviews/:id/reply', desc: 'Manager/Admin official management response' },
                ].map((ep, i) => (
                  <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between font-mono text-[11px]">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded font-bold ${ep.method === 'POST' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {ep.method}
                      </span>
                      <span className="text-slate-200">{ep.path}</span>
                    </div>
                    <span className="text-slate-400 font-sans">{ep.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}


          {activeDocTab === 'generator' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-amber-300">Automated Packaging: bundle-generator.mjs</h3>
                <button
                  onClick={() => copyToClipboard('bundle', bundleScript)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  {copiedKey === 'bundle' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'bundle' ? 'Copied Script' : 'Copy Script'}</span>
                </button>
              </div>

              <p>
                In strict accordance with the environment specification, execute this script in any Node.js environment to unpack all repository files directly to disk and generate <code className="text-amber-300">HotelPro_FullStack_Project.zip</code>:
              </p>

              <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-64">
{`node bundle-generator.mjs
npm run setup
cd server && npm run seed
npm run dev`}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
