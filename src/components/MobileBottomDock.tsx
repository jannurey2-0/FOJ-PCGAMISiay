import React from 'react';
import { LogOut } from 'lucide-react';
import type { UserProfile } from '../App';

interface MobileBottomDockProps {
  currentUser: UserProfile | null;
  activeTab: string;
  portalSubTab: string;
  setPortalSubTab: (tab: any) => void;
  onLogout: () => void;
}

export const MobileBottomDock: React.FC<MobileBottomDockProps> = ({
  currentUser,
  activeTab,
  portalSubTab,
  setPortalSubTab,
  onLogout
}) => {
  if (!currentUser || activeTab !== 'portal') return null;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-church-creamDark/80 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-2 py-2 pb-[calc(8px+env(safe-area-inset-bottom))] flex justify-around items-center">
      {/* Admin / Pastor Navigation List */}
      {(currentUser?.role === 'Admin' || currentUser?.role === 'Pastor') ? (
        <>
          {/* 1. Dashboard / RSVP */}
          <button
            type="button"
            onClick={() => setPortalSubTab('rsvp')}
            className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl text-sm font-semibold transition-all ${
              portalSubTab === 'rsvp' ? 'text-church-wood bg-church-wood/10' : 'text-church-charcoal/70'
            }`}
            title="Dashboard"
          >
            <span className="text-xl">📊</span>
          </button>

          {/* 2. Announcements & Schedules */}
          <button
            type="button"
            onClick={() => setPortalSubTab('announcements')}
            className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl text-sm font-semibold transition-all ${
              portalSubTab === 'announcements' ? 'text-church-wood bg-church-wood/10' : 'text-church-charcoal/70'
            }`}
            title="Announcements & Schedules"
          >
            <span className="text-xl">📢</span>
          </button>

          {/* 3. Community Chat (Center) */}
          <button
            type="button"
            onClick={() => setPortalSubTab('chat')}
            className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl text-sm font-semibold transition-all ${
              portalSubTab === 'chat' ? 'text-church-wood bg-church-wood/10' : 'text-church-charcoal/70'
            }`}
            title="Community Chat"
          >
            <span className="text-xl">💬</span>
          </button>

          {/* 4. User Approvals (Admin Only) */}
          {currentUser.role === 'Admin' ? (
            <button
              type="button"
              onClick={() => setPortalSubTab('users')}
              className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl text-sm font-semibold transition-all ${
                portalSubTab === 'users' ? 'text-church-wood bg-church-wood/10' : 'text-church-charcoal/70'
              }`}
              title="User Approvals"
            >
              <span className="text-xl">👥</span>
            </button>
          ) : (
            <div className="flex-1" /> // empty slot for spacing symmetry
          )}

          {/* 5. Settings & Slideshow (Admin Only) */}
          {currentUser.role === 'Admin' ? (
            <button
              type="button"
              onClick={() => setPortalSubTab('settings')}
              className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl text-sm font-semibold transition-all ${
                portalSubTab === 'settings' ? 'text-church-wood bg-church-wood/10' : 'text-church-charcoal/70'
              }`}
              title="Settings & Slideshow"
            >
              <span className="text-xl">⚙️</span>
            </button>
          ) : (
            <div className="flex-1" /> // empty slot for spacing symmetry
          )}
        </>
      ) : (
        /* Regular / Leader Navigation List */
        <>
          {/* 1. Announcements & Schedules */}
          <button
            type="button"
            onClick={() => setPortalSubTab('announcements')}
            className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl text-sm font-semibold transition-all ${
              portalSubTab === 'announcements' ? 'text-church-wood bg-church-wood/10' : 'text-church-charcoal/70'
            }`}
            title="Announcements & Schedules"
          >
            <span className="text-xl">📢</span>
          </button>

          {/* 2. Community Chat (Center) */}
          <button
            type="button"
            onClick={() => setPortalSubTab('chat')}
            className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl text-sm font-semibold transition-all ${
              portalSubTab === 'chat' ? 'text-church-wood bg-church-wood/10' : 'text-church-charcoal/70'
            }`}
            title="Community Chat"
          >
            <span className="text-xl">💬</span>
          </button>

          {/* 3. My Profile */}
          <button
            type="button"
            onClick={() => setPortalSubTab('profile')}
            className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl text-sm font-semibold transition-all ${
              portalSubTab === 'profile' ? 'text-church-wood bg-church-wood/10' : 'text-church-charcoal/70'
            }`}
            title="My Profile"
          >
            <span className="text-xl">👤</span>
          </button>
        </>
      )}

      {/* Log Out button (Always at the end) */}
      <button
        type="button"
        onClick={onLogout}
        className="flex-1 flex flex-col items-center justify-center p-2 rounded-xl text-red-600 transition-all cursor-pointer"
        title="Log Out"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  );
};
