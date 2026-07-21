import React from 'react';
import { Check } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  role: string;
  approved: boolean;
  email?: string;
}

interface ProfilePanelProps {
  currentUser: UserProfile;
}

export const ProfilePanel: React.FC<ProfilePanelProps> = ({ currentUser }) => {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-church-creamDark/80 shadow-sm space-y-6">
      <div className="flex items-center space-x-3 text-church-wood border-b border-church-creamDark pb-4">
        <div className="w-12 h-12 rounded-full bg-church-gold/20 flex items-center justify-center text-church-goldDark font-bold text-lg uppercase shrink-0">
          {currentUser?.name.substring(0, 2)}
        </div>
        <div>
          <h3 className="font-serif text-2xl font-bold text-church-wood">My Profile</h3>
          <p className="text-xs text-church-charcoal/60">View and manage your membership details</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-church-bg/40 p-4 rounded-xl border border-church-creamDark/50">
            <span className="text-[10px] uppercase font-bold text-church-charcoal/70 font-semibold tracking-wider block mb-1">Full Name</span>
            <span className="text-sm font-semibold text-stone-850">{currentUser?.name}</span>
          </div>
          <div className="bg-church-bg/40 p-4 rounded-xl border border-church-creamDark/50">
            <span className="text-[10px] uppercase font-bold text-church-charcoal/70 font-semibold tracking-wider block mb-1">Email Address</span>
            <span className="text-sm font-semibold text-stone-850 text-stone-600">{currentUser?.email || 'No email associated'}</span>
          </div>
          <div className="bg-church-bg/40 p-4 rounded-xl border border-church-creamDark/50">
            <span className="text-[10px] uppercase font-bold text-church-charcoal/70 font-semibold tracking-wider block mb-1">Role / Affiliation</span>
            <span className="text-sm font-semibold text-church-wood flex items-center space-x-1.5">
              <span className="inline-block px-2.5 py-0.5 bg-church-wood/10 text-church-wood rounded-full text-xs font-semibold">
                {currentUser?.role}
              </span>
            </span>
          </div>
          <div className="bg-church-bg/40 p-4 rounded-xl border border-church-creamDark/50">
            <span className="text-[10px] uppercase font-bold text-church-charcoal/70 font-semibold tracking-wider block mb-1">Approval Status</span>
            <span className="text-sm font-semibold text-green-600 flex items-center space-x-1">
              <Check className="w-4 h-4 shrink-0" />
              <span>Approved Account</span>
            </span>
          </div>
        </div>

        <div className="p-4 bg-church-gold/10 border border-church-gold/30 rounded-xl space-y-2">
          <h4 className="text-xs font-bold text-church-wood uppercase tracking-wider">Membership Benefits</h4>
          <p className="text-xs text-church-charcoal/80 leading-relaxed font-sans">
            As an approved <strong>{currentUser?.role}</strong>, you have access to the secure Portal menu. You can participate in active fellowship channels, review church schedules, and share announcements. Let's grow together in faith!
          </p>
        </div>
      </div>
    </div>
  );
};
