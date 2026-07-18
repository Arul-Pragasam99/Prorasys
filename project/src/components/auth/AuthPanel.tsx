'use client';

import { useState } from 'react';
import { useStore } from '@/components/commerce/StoreProvider';

export function AuthPanel() {
  const { login, isAuthenticated, userRole } = useStore();
  const [email, setEmail] = useState('customer@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleLogin = async () => {
    setBusy(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">Customer login</p>
      <h2 className="mt-3 text-2xl font-semibold text-slate-900">Sign in to manage orders and reviews</h2>
      <div className="mt-6 space-y-4">
        <label className="block text-sm text-slate-700">
          <span className="mb-2 block font-medium">Email</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3" />
        </label>
        <label className="block text-sm text-slate-700">
          <span className="mb-2 block font-medium">Password</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3" />
        </label>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <button onClick={handleLogin} disabled={busy} className="w-full rounded-full bg-slate-900 px-4 py-3 font-medium text-white disabled:opacity-60">
          {busy ? 'Signing in...' : isAuthenticated ? `Signed in as ${userRole}` : 'Sign in'}
        </button>
      </div>
    </div>
  );
}
