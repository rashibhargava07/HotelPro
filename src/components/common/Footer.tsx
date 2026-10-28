import React from 'react';
import { Crown, MapPin, Phone, Mail, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onOpenDocs: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDocs }) => {
  return (
    <footer className="bg-[#081a36] text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                <Crown className="w-5 h-5" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                HotelPro
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Curated boutique palace sanctuaries with guaranteed concurrency reservations, dynamic yield pricing, and real-time operations.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Certified 5-Star Heritage Architecture</span>
            </div>
          </div>

          {/* Locations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-300">
              Palace Sanctuaries
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>The Grand Heritage Palace & Spa (Lake Pichola, Udaipur)</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>The Oberoi Vilas Oasis (Aravalli Hills, Jaipur)</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Royal Nilgiri Retreat & Wellness (Ooty Highlands)</span>
              </li>
            </ul>
          </div>

          {/* Operations & RBAC */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-300">
              Operational Portals
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Guest Reservation Itineraries & Vouchers</li>
              <li>Front Desk Arrivals & Key Issuance</li>
              <li>Automated Turnaround & Housekeeping Dispatch</li>
              <li>Manager Occupancy & Dynamic Yield Pricing</li>
              <li>Admin Governance & Immutable Audit Logs</li>
            </ul>
          </div>

          {/* 24/7 Butler & Technical Specification */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-300">
              24/7 Imperial Concierge
            </h4>
            <div className="text-xs space-y-1.5 text-slate-400">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>+91 294 243 5000</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>concierge@hotelpro.com</span>
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenDocs}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700 transition"
              >
                Inspect System Architecture
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 HotelPro Monorepo • Full-Stack Boutique Hotel Architecture.</p>
          <div className="flex items-center gap-4">
            <span>Half-Open Availability Algorithm</span>
            <span>•</span>
            <span>Razorpay Sandbox</span>
            <span>•</span>
            <span>Zero-Race Concurrency Hold</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
