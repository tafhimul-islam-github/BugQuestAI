import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [targetRole, setTargetRole] = useState(user?.target_role || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      await api.auth.updateProfile({
        name,
        target_role: targetRole,
        bio,
      });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      <div className="border-b border-white/[0.06] pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Account & Profile Settings</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Manage your candidate information and learning target roles.</p>
      </div>

      <div className="quest-card p-6 sm:p-8">
        {saved && (
          <div className="mb-6 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile settings updated successfully.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-semibold">
              Account Email
            </label>
            <input
              type="text"
              disabled
              value={user?.email || ''}
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/[0.06] bg-obsidian-950/40 text-slate-500 cursor-not-allowed text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-1 font-semibold">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-obsidian-950 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-1 font-semibold">
              Target Engineering Role
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Full-Stack Engineer, Backend Developer"
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-obsidian-950 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-1 font-semibold">
              Short Candidate Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A brief overview of your focus areas and background."
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-obsidian-950 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs shadow-glow-sm transition-all"
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
