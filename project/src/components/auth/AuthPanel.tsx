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
    <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Customer login</p>
      <h2 className="mt-3 text-2xl font-semibold text-text-primary">Sign in to manage orders and reviews</h2>
      <div className="mt-6 space-y-4">
        <label className="block text-sm text-text-secondary">
          <span className="mb-2 block font-medium">Email</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
        </label>
        <label className="block text-sm text-text-secondary">
          <span className="mb-2 block font-medium">Password</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
        </label>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <button onClick={handleLogin} disabled={busy} className="w-full rounded-full bg-primary px-4 py-3 font-medium text-white disabled:opacity-60 hover:bg-primary-light transition-colors">
          {busy ? 'Signing in...' : isAuthenticated ? `Signed in as ${userRole}` : 'Sign in'}
        </button>
      </div>
    </div>
  );
}
