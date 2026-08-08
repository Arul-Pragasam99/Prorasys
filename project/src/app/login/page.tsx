'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/commerce/Header';
import { gsap } from 'gsap';
import { Shield, Star, Users, Sparkles, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useStore } from '@/components/commerce/StoreProvider';
import { loginUser, registerUser, loginWithGoogle, resetPassword } from '@/lib/auth-service';

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-surface text-text-primary"><Header /><div className="mx-auto max-w-7xl px-4 py-12 text-text-secondary">Loading...</div></main>}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { user, isAuthenticated } = useStore();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });

  const [signupRole, setSignupRole] = useState<'customer' | 'admin'>('customer');

  useEffect(() => {
    if (isAuthenticated && user) {
      router.push(redirect);
    }
  }, [isAuthenticated, user, router, redirect]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(leftRef.current, { opacity: 0, x: -40, duration: 0.8, ease: 'power3.out' });
      gsap.from(rightRef.current, { opacity: 0, x: 40, duration: 0.8, ease: 'power3.out', delay: 0.2 });
      gsap.from(formRef.current, { opacity: 0, y: 20, duration: 0.6, delay: 0.4, ease: 'power2.out' });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isLogin) {
        const result = await loginUser(formData.email, formData.password);
        if (result) {
          setSuccess('Login successful! Redirecting...');
          setTimeout(() => router.push(redirect), 1500);
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        const result = await registerUser(formData.email, formData.password, signupRole, formData.name);
        if (result) {
          setSuccess('Account created! Redirecting...');
          setTimeout(() => router.push(redirect), 1500);
        }
      }
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email. Please sign up first.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again or click "Forgot password".');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
        setTimeout(() => {
          setIsLogin(true);
          setFormData({ ...formData, password: '', confirmPassword: '' });
          setError(null);
        }, 2000);
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address. Please check and try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later or reset your password.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.');
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setSuccess(null);
    setGoogleLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result) {
        setSuccess('Google login successful! Redirecting...');
        setTimeout(() => router.push(redirect), 1500);
      }
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign in cancelled. Please try again.');
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError('An account exists with this email. Please sign in using your password.');
      } else {
        setError(err.message || 'Google login failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    const email = formData.email.trim();
    setResetError(null);
    setResetMessage(null);

    if (!email) {
      setResetError('Please enter your email address first.');
      return;
    }

    setResetLoading(true);
    try {
      await resetPassword(email);
      setResetMessage('✅ Password reset email sent! Check your inbox and spam folder.');
      setShowForgotPassword(false);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setResetMessage('If an account exists with this email, a reset link has been sent.');
        setShowForgotPassword(false);
      } else {
        setResetError(err.message || 'Unable to send reset email. Please try again.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  const features = [
    { icon: Shield, text: 'Secure authentication' },
    { icon: Star, text: 'Save favorites' },
    { icon: Users, text: 'Community reviews' },
    { icon: Sparkles, text: 'AI recommendations' },
  ];

  // ✅ Google login available for ALL users (both customer and admin, both login and signup)
  const showGoogleLogin = true;

  return (
    <main className="min-h-screen bg-surface text-text-primary">
      <Header />
      <section ref={sectionRef} className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        <div className="pt-20 lg:pt-24 grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Column - Info */}
          <div ref={leftRef} className="space-y-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                {isLogin ? 'Welcome Back' : 'Join Us'}
              </p>
              <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-text-primary">
                {isLogin ? 'Sign in to your account' : 'Create your account'}
              </h1>
              <p className="mt-3 text-lg text-text-secondary">
                {isLogin
                  ? 'Track orders, save favorites, and leave reviews.'
                  : 'Start your journey with AI-powered recommendations.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {features.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 p-3 bg-card rounded-theme border border-border hover:shadow-sm transition-all">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-sm text-text-secondary">{text}</span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-card rounded-theme border border-border">
              <p className="text-sm text-text-secondary">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  onClick={() => { 
                    setIsLogin(!isLogin); 
                    setError(null); 
                    setSuccess(null); 
                    setResetError(null);
                    setResetMessage(null);
                    setFormData({ ...formData, password: '', confirmPassword: '' }); 
                  }}
                  className="ml-2 text-primary font-medium hover:underline"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>

          {/* Right Column - Auth Form */}
          <div ref={rightRef} className="lg:sticky lg:top-24">
            <div className="bg-card rounded-theme-lg border border-border p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-primary/10 rounded-theme">
                  {isLogin ? <Lock className="w-5 h-5 text-primary" /> : <User className="w-5 h-5 text-primary" />}
                </div>
                <h2 className="text-xl font-semibold text-text-primary">{isLogin ? 'Sign In' : 'Sign Up'}</h2>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-theme text-danger text-sm">
                  {error}
                  {error.includes('already registered') && (
                    <button 
                      onClick={() => { setIsLogin(true); setError(null); }}
                      className="ml-2 underline font-medium hover:no-underline"
                    >
                      Sign in instead
                    </button>
                  )}
                </div>
              )}
              {success && <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-theme text-success text-sm">{success}</div>}
              {resetError && <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-theme text-danger text-sm">{resetError}</div>}
              {resetMessage && <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-theme text-success text-sm">{resetMessage}</div>}

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="label">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input pl-10"
                        placeholder="John Doe"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input pl-10"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input pl-10 pr-12"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {!isLogin && <p className="text-xs text-text-secondary mt-1">Must be at least 6 characters</p>}
                </div>

                {!isLogin && (
                  <div>
                    <label className="label">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="input pl-10"
                        placeholder="••••••••"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                {!isLogin && (
                  <div>
                    <label className="label">Account Type</label>
                    <select
                      value={signupRole}
                      onChange={(e) => setSignupRole(e.target.value as 'customer' | 'admin')}
                      className="input"
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                    <p className="text-xs text-text-secondary mt-1">
                      {signupRole === 'admin' ? 'Admins can manage products and reviews' : 'Customers can browse, review, and purchase'}
                    </p>
                  </div>
                )}

                {isLogin && (
                  <div className="flex items-center justify-between gap-2">
                    <label className="flex items-center gap-2 text-sm text-text-secondary">
                      <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" /> Remember me
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword((prev) => !prev);
                        setResetError(null);
                        setResetMessage(null);
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {isLogin && showForgotPassword && (
                  <div className="rounded-theme border border-border bg-surface p-3">
                    <p className="text-sm font-medium text-text-primary">Reset password for your account</p>
                    <p className="mt-1 text-xs text-text-secondary">Use the email linked to your account.</p>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input flex-1"
                        placeholder="you@example.com"
                      />
                      <button
                        type="button"
                        onClick={handlePasswordReset}
                        disabled={resetLoading}
                        className="px-4 py-2 bg-secondary text-white rounded-theme font-medium hover:bg-secondary-light transition-colors disabled:opacity-50"
                      >
                        {resetLoading ? 'Sending...' : 'Send link'}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary text-white rounded-theme font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isLogin ? 'Signing in...' : 'Creating account...'}
                    </span>
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
                </button>

                {/* ✅ Google Login - Available for ALL users (both login and signup) */}
                <>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                    <div className="relative flex justify-center text-sm"><span className="px-4 bg-card text-text-secondary">Or continue with</span></div>
                  </div>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={googleLoading}
                    className="w-full flex items-center justify-center gap-3 py-3 border border-border rounded-theme hover:bg-surface transition-colors disabled:opacity-50"
                  >
                    {googleLoading ? (
                      <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                      </svg>
                    )}
                    <span className="text-sm font-medium text-text-primary">
                      {googleLoading ? 'Signing in...' : 'Sign in with Google'}
                    </span>
                  </button>
                </>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}