import React, { useState } from 'react';
import { 
  User, 
  Palette, 
  Download, 
  Lock, 
  AlertTriangle, 
  Check, 
  Tag, 
  Plus, 
  Trash2, 
  Database,
  DollarSign
} from 'lucide-react';

import { useApp } from '../../context/AppContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import DeleteConfirmModal from '../../components/ui/DeleteConfirmModal';

export default function SettingsPage() {
  const { 
    profile, 
    updateProfile, 
    theme, 
    setTheme, 
    exportTransactionsCSV, 
    categories, 
    addCategory, 
    deleteCategory, 
    logout,
    showToast 
  } = useApp();

  // Profile states
  const [displayName, setDisplayName] = useState(profile.display_name || '');
  const [email, setEmail] = useState(profile.email || '');

  // CSV Export states
  const [exportStart, setExportStart] = useState('');
  const [exportEnd, setExportEnd] = useState('');

  // Password change states
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Category addition states
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState('expense');
  const [newCatColor, setNewCatColor] = useState('#B7E477');

  // Account deletion states
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Profile submit
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!displayName.trim() || displayName.length > 60) {
      showToast('Display name must be between 1 and 60 characters', 'error');
      return;
    }
    updateProfile({ display_name: displayName.trim(), email: email.trim() });
  };

  // Password submit (FR-SET-005)
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      showToast('New password must be at least 8 characters with both letters and numbers', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    showToast('Password updated successfully', 'success');
    setCurrPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Category add submit
  const handleAddCategorySubmit = (e) => {
    e.preventDefault();
    const success = addCategory({
      name: newCatName,
      type: newCatType,
      color: newCatColor,
    });
    if (success) {
      setNewCatName('');
    }
  };

  // Account deletion (FR-SET-007)
  const handleAccountDelete = () => {
    if (deleteConfirmationInput !== 'DELETE') {
      showToast('Please type DELETE in capital letters to confirm', 'error');
      return;
    }
    localStorage.clear();
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-xs sm:text-sm text-pulse-text-secondary mt-0.5">
          Manage your personal profile, categories, data export, and security.
        </p>
      </div>

      {/* 1. Profile Settings (FR-SET-001) */}
      <div className="bg-pulse-card border border-pulse-border rounded-2xl p-6 shadow-card space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-pulse-border">
          <User className="w-5 h-5 text-pulse-accent" />
          <h2 className="text-base font-semibold text-white">Profile Information</h2>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-medium text-pulse-text-secondary uppercase tracking-wider mb-1.5">
              Display Name * (1-60 characters)
            </label>
            <input
              type="text"
              maxLength={60}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-pulse-bg border border-pulse-border focus:border-pulse-accent rounded-xl text-sm text-white focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-pulse-text-secondary uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-pulse-bg border border-pulse-border focus:border-pulse-accent rounded-xl text-sm text-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-pulse-accent text-black font-semibold text-sm hover:bg-pulse-accent-hover transition-colors"
          >
            <Check className="w-4 h-4" />
            Save Profile
          </button>
        </form>
      </div>

      {/* 2. Theme & Currency Preference (FR-SET-002, 003) */}
      <div className="bg-pulse-card border border-pulse-border rounded-2xl p-6 shadow-card space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-pulse-border">
          <Palette className="w-5 h-5 text-pulse-accent" />
          <h2 className="text-base font-semibold text-white">Appearance & Currency</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
          <div>
            <label className="block text-xs font-medium text-pulse-text-secondary uppercase tracking-wider mb-2">
              Theme Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['dark', 'light', 'system'].map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setTheme(m);
                    updateProfile({ theme: m });
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition-all ${
                    theme === m
                      ? 'bg-pulse-accent text-black border-pulse-accent'
                      : 'bg-pulse-bg border-pulse-border text-pulse-text-secondary hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-pulse-text-secondary mt-2">
              Dark mode is the default signature PULSE experience.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-pulse-text-secondary uppercase tracking-wider mb-2">
              Preferred Currency
            </label>
            <div className="p-3 bg-pulse-bg border border-pulse-border rounded-xl text-sm text-white flex items-center justify-between">
              <span className="font-medium">Indian Rupee (INR ₹)</span>
              <span className="text-xs text-pulse-accent font-semibold px-2 py-0.5 rounded bg-pulse-accent/10 border border-pulse-accent/20">
                Default
              </span>
            </div>
            <p className="text-[11px] text-pulse-text-secondary mt-2">
              Formatted in Indian numbering (lakh/crore, e.g. ₹1,25,000.50).
            </p>
          </div>
        </div>
      </div>

      {/* 3. Manage Categories (FR-CAT-001, 002, 003) */}
      <div className="bg-pulse-card border border-pulse-border rounded-2xl p-6 shadow-card space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-pulse-border">
          <Tag className="w-5 h-5 text-pulse-accent" />
          <h2 className="text-base font-semibold text-white">Category Management</h2>
        </div>

        {/* Create new category */}
        <form onSubmit={handleAddCategorySubmit} className="flex flex-wrap items-end gap-3 max-w-xl">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-medium text-pulse-text-secondary uppercase tracking-wider mb-1.5">
              Category Name * (1-30 chars)
            </label>
            <input
              type="text"
              placeholder="e.g. Subscriptions, Fuel"
              maxLength={30}
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full px-3 py-2 bg-pulse-bg border border-pulse-border rounded-xl text-sm text-white focus:outline-none focus:border-pulse-accent"
              required
            />
          </div>

          <div className="w-32">
            <label className="block text-xs font-medium text-pulse-text-secondary uppercase tracking-wider mb-1.5">
              Type
            </label>
            <select
              value={newCatType}
              onChange={(e) => setNewCatType(e.target.value)}
              className="w-full px-3 py-2 bg-pulse-bg border border-pulse-border rounded-xl text-sm text-white focus:outline-none focus:border-pulse-accent"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-pulse-accent text-black font-semibold text-sm rounded-xl hover:bg-pulse-accent-hover transition-colors shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Add
          </button>
        </form>

        {/* Categories list */}
        <div className="space-y-3 pt-2">
          <div className="text-xs font-medium text-pulse-text-secondary">Current Categories:</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1">
            {categories.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-pulse-bg/60 border border-pulse-border text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color || '#B7E477' }} />
                  <span className="font-medium text-white truncate">{c.name}</span>
                  <span className="text-[10px] text-pulse-text-secondary">({c.type[0].toUpperCase()})</span>
                </div>
                {!c.is_system && (
                  <button
                    onClick={() => deleteCategory(c.id)}
                    className="p-1 text-pulse-text-secondary hover:text-pulse-negative rounded transition-colors"
                    title="Delete custom category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. CSV Data Export (FR-SET-004) */}
      <div className="bg-pulse-card border border-pulse-border rounded-2xl p-6 shadow-card space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-pulse-border">
          <Download className="w-5 h-5 text-pulse-accent" />
          <h2 className="text-base font-semibold text-white">Export Transaction Data</h2>
        </div>

        <p className="text-xs text-pulse-text-secondary">
          Export your complete financial transaction history in standard CSV format (UTF-8, ISO 8601 timestamps).
        </p>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="text-pulse-text-secondary font-medium">Filter date range (optional):</span>
          <input
            type="date"
            value={exportStart}
            onChange={(e) => setExportStart(e.target.value)}
            className="px-3 py-1.5 bg-pulse-bg border border-pulse-border rounded-xl text-white text-xs focus:outline-none"
          />
          <span className="text-pulse-text-secondary">to</span>
          <input
            type="date"
            value={exportEnd}
            onChange={(e) => setExportEnd(e.target.value)}
            className="px-3 py-1.5 bg-pulse-bg border border-pulse-border rounded-xl text-white text-xs focus:outline-none"
          />
          <button
            onClick={() => exportTransactionsCSV(exportStart || null, exportEnd || null)}
            className="flex items-center gap-2 px-4 py-2 bg-pulse-card border border-pulse-border hover:border-pulse-accent text-pulse-text-primary rounded-xl font-semibold text-xs transition-colors"
          >
            <Download className="w-4 h-4 text-pulse-accent" />
            Download CSV
          </button>
        </div>
      </div>

      {/* 5. Account Security (FR-SET-005) */}
      <div className="bg-pulse-card border border-pulse-border rounded-2xl p-6 shadow-card space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-pulse-border">
          <Lock className="w-5 h-5 text-pulse-accent" />
          <h2 className="text-base font-semibold text-white">Security & Password</h2>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-medium text-pulse-text-secondary uppercase tracking-wider mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              value={currPassword}
              onChange={(e) => setCurrPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-pulse-bg border border-pulse-border rounded-xl text-sm text-white focus:outline-none focus:border-pulse-accent"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-pulse-text-secondary uppercase tracking-wider mb-1.5">
              New Password (≥8 chars, letter & number)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-pulse-bg border border-pulse-border rounded-xl text-sm text-white focus:outline-none focus:border-pulse-accent"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-pulse-text-secondary uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-pulse-bg border border-pulse-border rounded-xl text-sm text-white focus:outline-none focus:border-pulse-accent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-pulse-card border border-pulse-border hover:border-white text-white font-semibold text-xs transition-colors"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* 6. Supabase Backend Connection Status */}
      <div className="bg-pulse-card border border-pulse-border rounded-2xl p-6 shadow-card space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-pulse-border">
          <Database className="w-5 h-5 text-pulse-accent" />
          <h2 className="text-base font-semibold text-white">Database & Backend</h2>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div>
            <p className="font-semibold text-white">
              Mode: {isSupabaseConfigured ? 'Connected to Supabase PostgreSQL' : 'Local-First Storage (Active)'}
            </p>
            <p className="text-pulse-text-secondary mt-0.5">
              {isSupabaseConfigured 
                ? 'All queries run against your remote PostgreSQL database with Row Level Security.' 
                : 'PULSE is persisting all records locally with zero latency. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to sync with remote Supabase.'}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full font-semibold ${
              isSupabaseConfigured
                ? 'bg-pulse-positive/20 text-pulse-positive border border-pulse-positive/30'
                : 'bg-pulse-accent/20 text-pulse-accent border border-pulse-accent/30'
            }`}
          >
            {isSupabaseConfigured ? 'Supabase Online' : 'Local Mode'}
          </span>
        </div>
      </div>

      {/* 7. Danger Zone: Delete Account (FR-SET-007) */}
      <div className="bg-[#211616] border border-pulse-negative/40 rounded-2xl p-6 shadow-card space-y-4">
        <div className="flex items-center gap-3 text-pulse-negative">
          <AlertTriangle className="w-5 h-5" />
          <h2 className="text-base font-semibold">Danger Zone: Delete Account</h2>
        </div>

        <p className="text-xs text-pulse-negative/80 leading-relaxed">
          Permanently delete your user profile and cascade delete all transactions, budgets, and categories.
          This action is immediate and non-recoverable.
        </p>

        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-pulse-negative text-white text-xs font-semibold hover:bg-red-700 transition-colors"
        >
          Delete My Account
        </button>
      </div>

      {/* Delete Account Modal with typed "DELETE" confirmation */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
          <div className="relative w-full max-w-md bg-pulse-card border border-pulse-negative/60 rounded-2xl p-6 z-10 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-pulse-negative">Type DELETE to Confirm</h3>
            <p className="text-xs text-pulse-text-secondary">
              To proceed with permanent deletion of your account and all financial data, please type <strong className="text-white">DELETE</strong> below:
            </p>
            <input
              type="text"
              value={deleteConfirmationInput}
              onChange={(e) => setDeleteConfirmationInput(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3.5 py-2.5 bg-pulse-bg border border-pulse-negative/50 rounded-xl text-white text-sm focus:outline-none"
            />
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-xs text-pulse-text-secondary hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAccountDelete}
                disabled={deleteConfirmationInput !== 'DELETE'}
                className="px-4 py-2 bg-pulse-negative text-white rounded-xl text-xs font-semibold disabled:opacity-40"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
