'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/commerce/Header';
import { useStore } from '@/components/commerce/StoreProvider';
import { updateUserProfile } from '@/lib/auth-service';
import { User, Mail, Shield, Calendar, Edit2, Save, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/profile');
      return;
    }
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        email: user.email || '',
      });
    }
    setLoading(false);
  }, [isAuthenticated, user, router]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setMessage(null);

    try {
      await updateUserProfile(user.uid, {
        displayName: formData.displayName,
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditing(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-surface text-text-primary">
        <Header />
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface text-text-primary">
      <Header />
      
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-16">
        <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text-primary">My Profile</h1>
                <p className="text-sm text-text-secondary">Manage your account settings</p>
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              {editing ? 'Cancel' : <><Edit2 className="w-4 h-4" /> Edit Profile</>}
            </button>
          </div>

          {message && (
            <div className={`p-3 rounded-lg mb-4 ${
              message.type === 'success' 
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20' 
                : 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20'
            }`}>
              {message.text}
            </div>
          )}

          <div className="space-y-6">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Display Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full p-3 border border-border bg-surface text-text-primary rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                />
              ) : (
                <div className="flex items-center gap-2 p-3 bg-surface rounded-xl border border-border">
                  <User className="w-4 h-4 text-text-secondary" />
                  <span>{formData.displayName || 'Not set'}</span>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Email Address
              </label>
              <div className="flex items-center gap-2 p-3 bg-surface rounded-xl border border-border">
                <Mail className="w-4 h-4 text-text-secondary" />
                <span>{formData.email}</span>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Account Type
              </label>
              <div className="flex items-center gap-2 p-3 bg-surface rounded-xl border border-border">
                <Shield className="w-4 h-4 text-text-secondary" />
                <span className="capitalize">{user?.role || 'Customer'}</span>
                {user?.role === 'admin' && (
                  <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                    Admin
                  </span>
                )}
              </div>
            </div>

            {/* Member Since */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Member Since
              </label>
              <div className="flex items-center gap-2 p-3 bg-surface rounded-xl border border-border">
                <Calendar className="w-4 h-4 text-text-secondary" />
                <span>{new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
            </div>

            {editing && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}