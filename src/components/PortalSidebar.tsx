import React from 'react';
import { LogOut } from 'lucide-react';
import type { UserProfile } from '../App';

interface PortalSidebarProps {
  currentUser: UserProfile;
  portalSubTab: string;
  setPortalSubTab: (tab: any) => void;
  onLogout: () => void;
}

export const PortalSidebar: React.FC<PortalSidebarProps> = ({
  currentUser,
  portalSubTab,
  setPortalSubTab,
  onLogout
}) => {
  return (
    <div className="hidden lg:block w-64 flex-shrink-0">
      <div className="bg-white rounded-2xl border border-church-creamDark/80 p-4 lg:sticky lg:top-8 shadow-sm flex flex-col space-y-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-church-charcoal/50 px-3 mb-3">Portal Menu</h3>

        {/* 1. Dashboard (For Admin & Pastor) */}
        {(currentUser.role === 'Admin' || currentUser.role === 'Pastor') && (
          <button
            type="button"
            onClick={() => setPortalSubTab('rsvp')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${portalSubTab === 'rsvp' ? 'bg-church-wood text-white shadow-sm' : 'text-church-charcoal hover:bg-church-creamDark/40'
              }`}
          >
            <span className="text-base">📊</span>
            <span>Dashboard / RSVP</span>
          </button>
        )}

        {/* 2. Announcements & Schedules */}
        <button
          type="button"
          onClick={() => setPortalSubTab('announcements')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${portalSubTab === 'announcements' ? 'bg-church-wood text-white shadow-sm' : 'text-church-charcoal hover:bg-church-creamDark/40'
            }`}
        >
          <span className="text-base">📢</span>
          <span>Announcements</span>
        </button>

        {/* 3. Messages / Community Chat (Center) */}
        <button
          type="button"
          onClick={() => setPortalSubTab('chat')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${portalSubTab === 'chat' ? 'bg-church-wood text-white shadow-sm' : 'text-church-charcoal hover:bg-church-creamDark/40'
            }`}
        >
          <div className="flex items-center space-x-3">
            <span className="text-base">💬</span>
            <span>Community Chat</span>
          </div>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
            portalSubTab === 'chat' ? 'bg-white/20 text-white' : 'bg-church-gold/20 text-church-wood'
          }`}>
            Live
          </span>
        </button>

        {/* 4. User Approvals (Admin only) */}
        {currentUser.role === 'Admin' && (
          <button
            type="button"
            onClick={() => setPortalSubTab('users')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${portalSubTab === 'users' ? 'bg-church-wood text-white shadow-sm' : 'text-church-charcoal hover:bg-church-creamDark/40'
              }`}
          >
            <span className="text-base">👥</span>
            <span>User Approvals</span>
          </button>
        )}

        {/* 5. System Settings & Slideshow (Admin only) */}
        {currentUser.role === 'Admin' && (
          <button
            type="button"
            onClick={() => setPortalSubTab('settings')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${portalSubTab === 'settings' ? 'bg-church-wood text-white shadow-sm' : 'text-church-charcoal hover:bg-church-creamDark/40'
              }`}
          >
            <span className="text-base">⚙️</span>
            <span>Settings & Slideshow</span>
          </button>
        )}

        {/* Profile (Non-admin only) */}
        {currentUser.role !== 'Admin' && (
          <button
            type="button"
            onClick={() => setPortalSubTab('profile')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${portalSubTab === 'profile' ? 'bg-church-wood text-white shadow-sm' : 'text-church-charcoal/80 hover:bg-church-creamDark/40'
              }`}
          >
            <span className="text-base">👤</span>
            <span>My Profile</span>
          </button>
        )}

        <div className="border-t border-church-creamDark/60 pt-2 mt-2">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-650 hover:bg-red-50 transition-all cursor-pointer text-red-600"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
