import React from 'react';
import { Users, Check, X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface UserProfile {
  id: string;
  name: string;
  role: string;
  approved: boolean;
  email?: string;
}

interface UsersPanelProps {
  currentUser: UserProfile;
  profilesList: UserProfile[];
  fetchProfiles: () => void;
  showToast: (msg: string, type?: any, title?: string) => void;
}

export const UsersPanel: React.FC<UsersPanelProps> = ({
  currentUser,
  profilesList,
  fetchProfiles,
  showToast
}) => {
  if (currentUser.role !== 'Admin') return null;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-church-wood shadow-md space-y-6">
      <div className="flex items-center space-x-2 text-church-wood border-b border-church-creamDark pb-4">
        <Users className="w-6 h-6 text-church-gold" />
        <h3 className="font-serif text-2xl font-bold">User Moderation</h3>
      </div>

      <div className="space-y-4">
        <h4 className="font-bold text-xs uppercase tracking-wider text-church-charcoal/70">Pending Approvals ({profilesList.filter(p => !p.approved).length})</h4>
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {profilesList.filter(p => !p.approved).length === 0 ? (
            <p className="text-xs text-church-charcoal/50 text-center py-2">No pending user registrations.</p>
          ) : (
            profilesList.filter(p => !p.approved).map((profile) => (
              <div key={profile.id} className="bg-church-bg p-3 rounded-lg border border-church-creamDark space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-church-wood block">{profile.name}</span>
                    <span className="text-[10px] text-church-charcoal/50 block">Requested: {profile.role}</span>
                  </div>
                  <div className="flex space-x-1.5">
                    <button
                      type="button"
                      onClick={async () => {
                        const { error } = await supabase.from('profiles').delete().eq('id', profile.id);
                        if (error) showToast(error.message, 'error', 'Error');
                        else {
                          showToast('Registration request denied and deleted.', 'info', 'User Moderation');
                          fetchProfiles();
                        }
                      }}
                      className="p-1 bg-red-50 text-red-600 hover:bg-red-100 rounded cursor-pointer"
                      title="Deny / Delete"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const { error } = await supabase.from('profiles').update({ approved: true }).eq('id', profile.id);
                        if (error) showToast(error.message, 'error', 'Error');
                        else {
                          showToast('User approved successfully!', 'success', 'User Moderation');
                          fetchProfiles();
                        }
                      }}
                      className="p-1 bg-green-50 text-green-600 hover:bg-green-100 rounded cursor-pointer"
                      title="Approve User"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-4 pt-2 border-t border-church-creamDark">
        <h4 className="font-bold text-xs uppercase tracking-wider text-church-charcoal/70">All Approved Members ({profilesList.filter(p => p.approved).length})</h4>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {profilesList.filter(p => p.approved).map((profile) => (
            <div key={profile.id} className="flex justify-between items-center text-xs p-2 bg-church-bg/50 rounded-lg">
              <div>
                <span className="font-semibold text-church-wood block">{profile.name}</span>
                <span className="text-[10px] text-church-charcoal/50">{profile.role}</span>
              </div>
              {profile.email !== 'admin@pcgami.org' && (
                <div className="flex space-x-1 items-center">
                  <select
                    value={profile.role}
                    onChange={async (e) => {
                      const newRole = e.target.value;
                      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', profile.id);
                      if (error) showToast(error.message, 'error', 'Error');
                      else {
                        showToast(`Role updated to ${newRole}.`, 'success', 'User Moderation');
                        fetchProfiles();
                      }
                    }}
                    className="px-1.5 py-0.5 border border-church-creamDark rounded text-[10px] bg-white text-church-charcoal focus:outline-none"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Pastor">Pastor</option>
                    <option value="Church Leader">Church Leader</option>
                    <option value="Youth Leader">Youth Leader</option>
                    <option value="Church Member">Church Member</option>
                    <option value="Young People">Young People</option>
                  </select>
                  <button
                    type="button"
                    onClick={async () => {
                      const { error } = await supabase.from('profiles').update({ approved: false }).eq('id', profile.id);
                      if (error) showToast(error.message, 'error', 'Error');
                      else {
                        showToast('User access revoked.', 'info', 'User Moderation');
                        fetchProfiles();
                      }
                    }}
                    className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                    title="Revoke Access"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
