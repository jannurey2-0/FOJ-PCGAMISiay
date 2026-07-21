import React from 'react';
import { BookOpen, Calendar, X } from 'lucide-react';
import type { UserProfile, Announcement, ActivitySchedule, SystemSettings } from '../../App';

interface AnnouncementsPanelProps {
  currentUser: UserProfile;
  announcementsList: Announcement[];
  announcementTitle: string;
  setAnnouncementTitle: (title: string) => void;
  announcementContent: string;
  setAnnouncementContent: (content: string) => void;
  handleCreateAnnouncement: (e: React.FormEvent) => void;
  handleDeleteAnnouncement: (id: string) => void;
  activitySchedulesList: ActivitySchedule[];
  
  // Schedule Management Props
  systemSettings: SystemSettings | null;
  scheduleTitle: string;
  setScheduleTitle: (title: string) => void;
  scheduleDescription: string;
  setScheduleDescription: (desc: string) => void;
  scheduleDate: string;
  setScheduleDate: (date: string) => void;
  handleCreateSchedule: (e: React.FormEvent) => void;
  handleDeleteSchedule: (id: string) => void;
  handlePinEvent: (id: string | null) => void;
}

export const AnnouncementsPanel: React.FC<AnnouncementsPanelProps> = ({
  currentUser,
  announcementsList,
  announcementTitle,
  setAnnouncementTitle,
  announcementContent,
  setAnnouncementContent,
  handleCreateAnnouncement,
  handleDeleteAnnouncement,
  activitySchedulesList,
  
  systemSettings,
  scheduleTitle,
  setScheduleTitle,
  scheduleDescription,
  setScheduleDescription,
  scheduleDate,
  setScheduleDate,
  handleCreateSchedule,
  handleDeleteSchedule,
  handlePinEvent
}) => {
  const isLeader = ['Admin', 'Pastor', 'Church Leader'].includes(currentUser.role);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {/* Announcement Board */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-church-creamDark/80 shadow-sm space-y-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-church-creamDark pb-4">
            <h3 className="font-serif text-2xl font-bold text-church-wood flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-church-gold" />
              <span>Church Announcements</span>
            </h3>
            <span className="text-xs uppercase tracking-widest text-church-gold font-bold">Latest Updates</span>
          </div>

          {/* Leader Form to Post Announcement */}
          {isLeader && (
            <form onSubmit={handleCreateAnnouncement} className="bg-church-creamDark/20 p-4 rounded-xl border border-church-gold/20 space-y-3">
              <span className="text-[10px] uppercase font-bold text-church-wood tracking-wider block">Post New Announcement</span>
              <div>
                <input
                  type="text"
                  required
                  placeholder="Announcement Title"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-church-creamDark bg-white focus:outline-none focus:border-church-gold text-church-charcoal"
                />
              </div>
              <div>
                <textarea
                  required
                  rows={2}
                  placeholder="Announcement content..."
                  value={announcementContent}
                  onChange={(e) => setAnnouncementContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-church-creamDark bg-white focus:outline-none focus:border-church-gold text-church-charcoal"
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 bg-church-wood hover:bg-church-gold text-white hover:text-church-wood font-bold rounded text-xs transition-all shadow cursor-pointer animate-press"
              >
                Post Announcement
              </button>
            </form>
          )}

          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
            {announcementsList.length === 0 ? (
              <p className="text-xs text-church-charcoal/50 text-center py-4">No active announcements.</p>
            ) : (
              announcementsList.map((ann) => (
                <div key={ann.id} className="p-4 bg-church-creamDark/20 rounded-xl border-l-4 border-church-gold space-y-1.5 relative group">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-church-wood">{ann.title}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-church-charcoal/50">
                        {new Date(ann.created_at).toLocaleDateString([], { dateStyle: 'medium' })}
                      </span>
                      {isLeader && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAnnouncement(ann.id)}
                          className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
                          title="Delete Announcement"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-church-charcoal/80 whitespace-pre-line">{ann.content}</p>
                  <div className="text-[9px] text-church-charcoal/50 text-right font-medium">
                    — Posted by {ann.author}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Ministry Schedule & Calendar */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-church-creamDark shadow-sm space-y-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-church-creamDark pb-4">
            <h3 className="font-serif text-2xl font-bold text-church-wood flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-church-gold" />
              <span>Ministry Schedules</span>
            </h3>
            <span className="text-xs uppercase tracking-widest text-church-gold font-bold">Upcoming Fellowship</span>
          </div>

          {/* Leader Form to Create Schedule */}
          {isLeader && (
            <form onSubmit={handleCreateSchedule} className="bg-church-creamDark/20 p-4 rounded-xl border border-church-gold/20 space-y-3">
              <span className="text-[10px] uppercase font-bold text-church-wood tracking-wider block">Create New Schedule</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Event Title"
                    value={scheduleTitle}
                    onChange={(e) => setScheduleTitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded border border-church-creamDark bg-white focus:outline-none focus:border-church-gold text-church-charcoal"
                  />
                </div>
                <div>
                  <input
                    type="datetime-local"
                    required
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded border border-church-creamDark bg-white focus:outline-none focus:border-church-gold text-church-charcoal"
                  />
                </div>
              </div>
              <div>
                <textarea
                  rows={1}
                  placeholder="Notes / description..."
                  value={scheduleDescription}
                  onChange={(e) => setScheduleDescription(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded border border-church-creamDark bg-white focus:outline-none focus:border-church-gold text-church-charcoal resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 bg-church-wood hover:bg-church-gold text-white hover:text-church-wood font-bold rounded text-xs transition-all shadow cursor-pointer animate-press"
              >
                Add Activity Schedule
              </button>
            </form>
          )}

          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
            {activitySchedulesList.length === 0 ? (
              <p className="text-xs text-church-charcoal/50 text-center py-4">No scheduled activities.</p>
            ) : (
              activitySchedulesList.map((sched) => {
                const dateObj = new Date(sched.event_date);
                const day = dateObj.toLocaleDateString([], { day: '2-digit' });
                const month = dateObj.toLocaleDateString([], { month: 'short' });
                const isPinned = systemSettings?.pinned_event_id === sched.id;
                
                return (
                  <div key={sched.id} className={`flex space-x-3 text-sm border-b border-church-creamDark/40 pb-3 last:border-0 last:pb-0 relative group ${isPinned ? 'bg-church-gold/5 p-2 rounded-lg border border-church-gold/20' : ''}`}>
                    <div className="w-10 h-10 bg-church-creamDark/80 rounded-lg flex flex-col items-center justify-center font-bold text-church-wood shrink-0">
                      <span className="text-xs leading-none">{day}</span>
                      <span className="text-[9px] uppercase tracking-wide">{month}</span>
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <h4 className="font-bold text-church-wood text-sm truncate">{sched.title}</h4>
                        {isPinned && <span className="text-[9px] bg-church-gold text-church-wood px-1 rounded">⭐ Pinned</span>}
                      </div>
                      {sched.description && (
                        <p className="text-xs text-church-charcoal/70 truncate">{sched.description}</p>
                      )}
                      <span className="text-[10px] text-church-goldDark font-semibold">
                        {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {isLeader && (
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handlePinEvent(isPinned ? null : sched.id)}
                          className={`p-1 rounded cursor-pointer transition-colors ${
                            isPinned ? 'text-church-gold hover:text-church-wood font-serif' : 'text-stone-400 hover:text-church-gold'
                          }`}
                          title={isPinned ? "Unpin event" : "Pin event"}
                        >
                          ⭐
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSchedule(sched.id)}
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                          title="Delete Schedule"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
