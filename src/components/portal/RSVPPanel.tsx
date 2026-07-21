import React from 'react';
import { Shield, X, Check } from 'lucide-react';

import type { UserProfile, GratitudeNote } from '../../App';

interface Volunteer {
  name: string;
  team: string;
}

interface RSVPPanelProps {
  currentUser: UserProfile;
  totalAdults: number;
  totalKids: number;
  volunteersList: Volunteer[];
  gratitudeNotes: GratitudeNote[];
  approveNote: (id: string) => void;
  hideNote: (id: string) => void;
}

export const RSVPPanel: React.FC<RSVPPanelProps> = ({
  currentUser,
  totalAdults,
  totalKids,
  volunteersList,
  gratitudeNotes,
  approveNote,
  hideNote
}) => {
  if (!['Admin', 'Pastor'].includes(currentUser.role)) return null;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-church-gold shadow-md space-y-6">
      <div className="flex items-center space-x-2 text-church-wood border-b border-church-creamDark pb-4">
        <Shield className="w-6 h-6 text-church-gold" />
        <h3 className="font-serif text-2xl font-bold">Facilitator Dashboard</h3>
      </div>

      {/* RSVP Analytics Tally */}
      <div className="space-y-4">
        <h4 className="font-bold text-xs uppercase tracking-wider text-church-charcoal/70">Thanksgiving Attendance Tally</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-church-creamDark/40 p-4 rounded-xl text-center">
            <span className="text-2xl font-bold text-church-wood block">{totalAdults}</span>
            <span className="text-xs text-church-charcoal/60">Total Adults</span>
          </div>
          <div className="bg-church-creamDark/40 p-4 rounded-xl text-center">
            <span className="text-2xl font-bold text-church-wood block">{totalKids}</span>
            <span className="text-xs text-church-charcoal/60">Total Children</span>
          </div>
        </div>
      </div>

      {/* Volunteers List sorted by team */}
      <div className="space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-wider text-church-charcoal/70">Volunteers By Team</h4>
        <div className="max-h-44 overflow-y-auto space-y-2 bg-church-bg p-3 rounded-lg text-xs">
          {volunteersList.length === 0 ? (
            <p className="text-church-charcoal/50 text-center">No volunteers registered yet.</p>
          ) : (
            volunteersList.map((v, i) => (
              <div key={i} className="flex justify-between items-center border-b border-church-creamDark pb-1.5 last:border-0 last:pb-0">
                <span className="font-semibold text-church-wood">{v.name}</span>
                <span className="bg-church-gold/20 text-church-goldDark px-2 py-0.5 rounded text-[10px] font-bold uppercase">{v.team}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Gratitude Notes Moderation queue */}
      <div className="space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-wider text-church-charcoal/70">Gratitude Moderation Queue</h4>
        <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
          {gratitudeNotes.filter(n => !n.approved).length === 0 ? (
            <p className="text-xs text-church-charcoal/50 text-center py-2">No pending gratitude notes.</p>
          ) : (
            gratitudeNotes.filter(n => !n.approved).map((note) => (
              <div key={note.id} className="bg-church-bg p-3 rounded-lg border border-church-creamDark space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-church-wood">{note.author}</span>
                  <span className="text-[10px] text-church-charcoal/50">{note.timestamp}</span>
                </div>
                <p className="italic text-church-charcoal/90">"{note.text}"</p>
                <div className="flex space-x-2 justify-end">
                  <button
                    type="button"
                    onClick={() => hideNote(note.id)}
                    className="p-1 bg-red-50 text-red-600 hover:bg-red-100 rounded cursor-pointer"
                    title="Reject/Hide"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => approveNote(note.id)}
                    className="p-1 bg-green-50 text-green-600 hover:bg-green-100 rounded cursor-pointer"
                    title="Approve note"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
