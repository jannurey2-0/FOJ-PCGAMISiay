import React from 'react';
import { X } from 'lucide-react';

interface InvitationModalProps {
  showInvitationModal: boolean;
  setShowInvitationModal: (show: boolean) => void;
  urlFamilyName: string | null;
  rsvpName: string;
  setRsvpName: (name: string) => void;
  rsvpAdults: number;
  setRsvpAdults: (adults: number) => void;
  rsvpKids: number;
  setRsvpKids: (kids: number) => void;
  rsvpVolunteer: string[];
  handleVolunteerChange: (team: string) => void;
  rsvpNote: string;
  setRsvpNote: (note: string) => void;
  handleRSVPSubmit: (e: React.FormEvent) => void;
}

export const InvitationModal: React.FC<InvitationModalProps> = ({
  showInvitationModal,
  setShowInvitationModal,
  urlFamilyName,
  rsvpName,
  setRsvpName,
  rsvpAdults,
  setRsvpAdults,
  rsvpKids,
  setRsvpKids,
  rsvpVolunteer,
  handleVolunteerChange,
  rsvpNote,
  setRsvpNote,
  handleRSVPSubmit
}) => {
  if (!showInvitationModal) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-church-charcoal/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative bg-church-bg max-w-lg w-full max-h-[calc(100vh-2rem)] rounded-2xl shadow-2xl border border-church-gold overflow-hidden flex flex-col">

        {/* Header / Vibe Banner */}
        <div className="bg-church-wood p-8 text-center text-white relative flex-shrink-0">
          <button
            onClick={() => setShowInvitationModal(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <span className="text-xs uppercase tracking-widest text-church-gold font-bold">Thanksgiving Celebration Invitation</span>
          <h2 className="font-serif text-3xl font-bold mt-2">Church Thanksgiving Celebration</h2>

          {/* Scripture Intro */}
          <div className="mt-4 border-t border-church-gold/30 pt-4 max-w-sm mx-auto">
            <p className="text-xs italic text-church-goldLight leading-relaxed">
              "Enter His gates with thanksgiving and His courts with praise; give thanks to Him and praise His name. For the Lord is good..." — Psalm 100:4-5
            </p>
          </div>
        </div>

        {/* RSVP Form Body */}
        <form onSubmit={handleRSVPSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-grow">

          {urlFamilyName && (
            <div className="p-3 bg-church-gold/10 border border-church-gold/30 rounded-xl text-center text-sm font-semibold text-church-wood flex items-center justify-center space-x-2">
              <span>Welcome, {urlFamilyName}! We are blessed to invite you.</span>
            </div>
          )}

          <div>
            <label className="block text-xs uppercase tracking-wider text-church-charcoal/70 font-semibold mb-1">Name / Family Name</label>
            <input
              type="text"
              required
              value={rsvpName}
              onChange={(e) => setRsvpName(e.target.value)}
              placeholder="e.g. The Jenkins Family"
              className="w-full px-4 py-2.5 rounded-lg border border-church-creamDark focus:outline-none focus:border-church-gold bg-white text-sm"
            />
          </div>

          {/* Headcount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-church-charcoal/70 font-semibold mb-1">Adults Attendance</label>
              <input
                type="number"
                min="1"
                required
                value={rsvpAdults}
                onChange={(e) => setRsvpAdults(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2.5 rounded-lg border border-church-creamDark focus:outline-none focus:border-church-gold bg-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-church-charcoal/70 font-semibold mb-1">Children Attendance</label>
              <input
                type="number"
                min="0"
                required
                value={rsvpKids}
                onChange={(e) => setRsvpKids(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-lg border border-church-creamDark focus:outline-none focus:border-church-gold bg-white text-sm"
              />
            </div>
          </div>

          {/* Volunteers checkboxes */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-church-charcoal/70 font-semibold mb-2">Volunteer Interest Teams</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {['Set-up', 'Welcoming', 'Audio-Visual', 'Clean-up'].map((team) => (
                <label key={team} className="flex items-start space-x-2.5 p-2.5 bg-white rounded-lg border border-church-creamDark/80 hover:border-church-gold/60 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={rsvpVolunteer.includes(team)}
                    onChange={() => handleVolunteerChange(team)}
                    className="rounded border-church-creamDark text-church-gold focus:ring-church-gold mt-0.5 shrink-0"
                  />
                  <span className="text-church-charcoal leading-snug">{team} Team</span>
                </label>
              ))}
            </div>
          </div>

          {/* Gratitude note */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-church-charcoal/70 font-semibold mb-1">Submit a Gratitude Wall Note</label>
            <textarea
              value={rsvpNote}
              onChange={(e) => setRsvpNote(e.target.value)}
              placeholder="Share a blessing or simple note of thanksgiving... (will go live on the wall upon moderation approval)"
              className="w-full px-4 py-2 rounded-lg border border-church-creamDark focus:outline-none focus:border-church-gold bg-white h-20 text-sm resize-none"
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setShowInvitationModal(false)}
              className="flex-1 py-3 border border-church-creamDark text-church-charcoal font-semibold rounded-lg hover:bg-church-creamDark transition-all cursor-pointer text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-church-wood hover:bg-church-gold text-white hover:text-church-wood font-bold rounded-lg shadow-md transition-all duration-300 cursor-pointer text-sm"
            >
              Submit RSVP
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
