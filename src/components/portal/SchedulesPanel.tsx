import React from 'react';
import { Calendar, X } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  role: string;
  approved: boolean;
  email?: string;
}

interface ActivitySchedule {
  id: string;
  title: string;
  description: string;
  event_date: string;
  created_at: string;
}

interface SystemSettings {
  id: string;
  church_name: string;
  banner_title: string;
  banner_subtitle: string;
  pinned_event_id: string | null;
  updated_at: string;
}

interface SchedulesPanelProps {
  currentUser: UserProfile;
  activitySchedulesList: ActivitySchedule[];
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

export const SchedulesPanel: React.FC<SchedulesPanelProps> = ({
  currentUser,
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
  if (!['Admin', 'Pastor', 'Church Leader'].includes(currentUser.role)) return null;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-church-wood shadow-md space-y-6">
      <div className="flex items-center space-x-2 text-church-wood border-b border-church-creamDark pb-4">
        <Calendar className="w-6 h-6 text-church-gold" />
        <h3 className="font-serif text-2xl font-bold">Church Schedules Manager</h3>
      </div>

      <form onSubmit={handleCreateSchedule} className="space-y-4">
        <h4 className="font-bold text-xs uppercase tracking-wider text-church-charcoal/70">Create New Schedule</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-church-charcoal/70 font-semibold mb-1">Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Youth Fellowship Service"
              value={scheduleTitle}
              onChange={(e) => setScheduleTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded border border-church-creamDark focus:outline-none focus:border-church-gold bg-white text-church-charcoal"
            />
          </div>
          <div>
            <label className="block text-xs text-church-charcoal/70 font-semibold mb-1">Event Date & Time</label>
            <input
              type="datetime-local"
              required
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded border border-church-creamDark focus:outline-none focus:border-church-gold bg-white text-church-charcoal"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-church-charcoal/70 font-semibold mb-1">Description / Notes</label>
          <textarea
            rows={2}
            placeholder="Describe the activity..."
            value={scheduleDescription}
            onChange={(e) => setScheduleDescription(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded border border-church-creamDark/60 focus:outline-none focus:border-church-gold bg-white text-church-charcoal"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-church-wood hover:bg-church-gold text-white hover:text-church-wood font-bold rounded text-xs transition-all shadow cursor-pointer animate-press"
        >
          Add Activity Schedule
        </button>
      </form>

      <div className="space-y-4 pt-4 border-t border-church-creamDark">
        <h4 className="font-bold text-xs uppercase tracking-wider text-church-charcoal/70">Active Activity Schedules ({activitySchedulesList.length})</h4>
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {activitySchedulesList.length === 0 ? (
            <p className="text-xs text-church-charcoal/50 text-center py-2">No activities scheduled.</p>
          ) : (
            activitySchedulesList.map((sched) => {
              const dateObj = new Date(sched.event_date);
              const isPinned = systemSettings?.pinned_event_id === sched.id;
              return (
                <div key={sched.id} className={`flex items-start justify-between p-3 rounded-lg text-xs border transition-all duration-300 ${
                  isPinned ? 'bg-church-gold/10 border-church-gold shadow-sm animate-pulseFast' : 'bg-church-bg/50 border-church-creamDark/60'
                }`}>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-xs text-church-wood block">{sched.title}</span>
                      {isPinned && (
                        <span className="text-[9px] bg-church-gold text-church-wood font-bold px-1.5 py-0.5 rounded flex items-center space-x-0.5">
                          <span>⭐ Pinned Countdown</span>
                        </span>
                      )}
                    </div>
                    {sched.description && <p className="text-[10px] text-church-charcoal/70">{sched.description}</p>}
                    <span className="inline-block text-[10px] text-church-goldDark bg-church-gold/10 px-2 py-0.5 rounded font-medium">
                      {dateObj.toLocaleDateString([], { dateStyle: 'medium' })} at {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 self-center">
                    {currentUser.role === 'Admin' && (
                      <button
                        type="button"
                        onClick={() => handlePinEvent(isPinned ? null : sched.id)}
                        className={`p-1 rounded cursor-pointer transition-all duration-200 ${
                          isPinned
                            ? 'bg-church-gold text-church-wood hover:bg-church-goldDark'
                            : 'bg-church-creamDark hover:bg-church-gold/20 text-church-charcoal hover:text-church-goldDark'
                        }`}
                        title={isPinned ? "Unpin from countdown" : "Pin to countdown"}
                      >
                        ⭐
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteSchedule(sched.id)}
                      className="p-1 bg-red-50 text-red-600 hover:bg-red-100 rounded cursor-pointer"
                      title="Delete Schedule"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
