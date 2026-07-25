'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/commerce/Header';
import { useStore } from '@/components/commerce/StoreProvider';
import { gsap } from 'gsap';
import { 
  ArrowRight, 
  Sparkles, 
  Shield, 
  Star, 
  TrendingUp, 
  Users, 
  CheckCircle,
  Brain,
  BarChart3,
  Clock,
  LogIn,
  ShoppingBag,
  User
} from 'lucide-react';

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useStore();
  const [mounted, setMounted] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Skip animations if not mounted
    if (!mounted) return;

    // Set initial states
    gsap.set(badgeRef.current, { opacity: 0, scale: 0.9 });
    gsap.set(titleRef.current, { opacity: 0, y: 60 });
    gsap.set(subtitleRef.current, { opacity: 0, y: 40 });
    gsap.set(ctaRef.current, { opacity: 0, y: 30 });
    gsap.set(statsRef.current?.children || [], { opacity: 0, y: 30 });
    gsap.set(featuresRef.current?.children || [], { opacity: 0, y: 40 });

    // Main timeline
    const tl = gsap.timeline({ 
      defaults: { ease: 'power3.out' },
      delay: 0.2,
    });

    tl.to(badgeRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      ease: 'back.out(1.7)',
    })
    .to(titleRef.current, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'back.out(1.7)',
    }, '-=0.2')
    .to(subtitleRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power2.out',
    }, '-=0.5')
    .to(ctaRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out',
    }, '-=0.3')
    .to(statsRef.current?.children || [], {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.12,
      ease: 'back.out(1.4)',
    }, '-=0.2')
    .to(featuresRef.current?.children || [], {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out',
    }, '-=0.1');

    // Floating animations
    const floatingEls = document.querySelectorAll('.floating-bg');
    floatingEls.forEach((el, i) => {
      gsap.to(el, {
        y: i === 0 ? 25 : -20,
        x: i === 0 ? 10 : -10,
        duration: 4 + i * 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.5,
      });
    });

  }, [mounted]);

  // Show loading state
  if (isLoading || !mounted) {
    return (
      <main className="min-h-screen bg-surface text-text-primary">
        <Header />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  const displayName = user?.displayName || 'User';

  return (
    <main className="min-h-screen bg-surface text-text-primary overflow-x-hidden">
      <Header />
      
      <section 
        ref={heroRef} 
        className="relative min-h-[90vh] flex items-center overflow-hidden pt-20 sm:pt-24 lg:pt-28"
        style={{
          background: 'radial-gradient(ellipse at 30% 50%, rgba(15, 110, 86, 0.08) 0%, var(--color-surface) 70%)',
        }}
      >
        <div className="floating-bg absolute top-20 right-10 lg:right-20 opacity-30">
          <div className="w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
        </div>
        <div className="floating-bg absolute bottom-20 left-10 lg:left-20 opacity-20">
          <div className="w-80 h-80 rounded-full bg-secondary/10 blur-3xl" />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5">
          <div className="w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-0">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div 
              ref={badgeRef}
              className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border shadow-sm opacity-0 mx-auto"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-text-secondary">
                {isAuthenticated ? `👋 Welcome back, ${displayName}!` : 'AI-Powered Product Discovery'}
              </span>
            </div>

            {/* Title */}
            <h1 
              ref={titleRef}
              className="mt-6 text-4xl sm:text-5xl lg:text-7xl font-bold text-text-primary leading-[1.1]"
            >
              {isAuthenticated ? 'Find Your Next' : 'Discover Products'}
              <span className="block text-primary mt-2">
                {isAuthenticated ? 'Favorite Product' : 'Built on Trust'}
              </span>
            </h1>

            {/* Subtitle */}
            <p 
              ref={subtitleRef}
              className="mt-6 text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed"
            >
              {isAuthenticated 
                ? 'Explore personalized recommendations and trusted products tailored just for you.'
                : 'AI-powered trust scores, sentiment analysis, and personalized recommendations — helping you make confident purchasing decisions.'
              }
            </p>

            {/* CTA Buttons */}
            <div ref={ctaRef} className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/products"
                    className="group inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white rounded-theme font-medium hover:bg-primary-light hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-1"
                  >
                    Browse Products
                    <ShoppingBag className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/recommendations"
                    className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-card text-text-primary rounded-theme border-2 border-border hover:border-primary hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    View AI Picks
                    <Sparkles className="w-4 h-4" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/products"
                    className="group inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white rounded-theme font-medium hover:bg-primary-light hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-1"
                  >
                    Start Exploring
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-card text-text-primary rounded-theme border-2 border-border hover:border-primary hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    Sign In
                    <LogIn className="w-4 h-4" />
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div ref={statsRef} className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {isAuthenticated ? (
                <>
                  <div className="bg-card/80 backdrop-blur-sm p-4 rounded-theme-lg border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <p className="text-3xl font-bold text-primary">10+</p>
                    <p className="text-sm text-text-secondary">Products Viewed</p>
                  </div>
                  <div className="bg-card/80 backdrop-blur-sm p-4 rounded-theme-lg border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <p className="text-3xl font-bold text-secondary">4.8★</p>
                    <p className="text-sm text-text-secondary">Your Avg Rating</p>
                  </div>
                  <div className="bg-card/80 backdrop-blur-sm p-4 rounded-theme-lg border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <p className="text-3xl font-bold text-accent">95%</p>
                    <p className="text-sm text-text-secondary">Trust Score</p>
                  </div>
                  <div className="bg-card/80 backdrop-blur-sm p-4 rounded-theme-lg border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <p className="text-3xl font-bold text-success">5</p>
                    <p className="text-sm text-text-secondary">Reviews Given</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-card/80 backdrop-blur-sm p-4 rounded-theme-lg border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <p className="text-3xl font-bold text-primary">10K+</p>
                    <p className="text-sm text-text-secondary">Happy Users</p>
                  </div>
                  <div className="bg-card/80 backdrop-blur-sm p-4 rounded-theme-lg border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <p className="text-3xl font-bold text-secondary">4.8★</p>
                    <p className="text-sm text-text-secondary">Avg Rating</p>
                  </div>
                  <div className="bg-card/80 backdrop-blur-sm p-4 rounded-theme-lg border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <p className="text-3xl font-bold text-accent">95%</p>
                    <p className="text-sm text-text-secondary">Trust Score</p>
                  </div>
                  <div className="bg-card/80 backdrop-blur-sm p-4 rounded-theme-lg border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <p className="text-3xl font-bold text-success">24/7</p>
                    <p className="text-sm text-text-secondary">AI Support</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 py-16 lg:py-24">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Why Prorasys</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-text-primary">Built for Modern Shopping</h2>
          <p className="mt-3 text-text-secondary max-w-2xl mx-auto">
            Everything you need to make informed purchasing decisions with confidence.
          </p>
        </div>

        <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card rounded-theme-lg border border-border p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-primary/10 rounded-theme flex items-center justify-center mb-4">
              <Brain className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-semibold text-text-primary text-lg">AI Sentiment Analysis</h3>
            <p className="text-text-secondary text-sm mt-2 leading-relaxed">
              Advanced AI analyzes reviews to understand real customer sentiment and product quality.
            </p>
          </div>

          <div className="bg-card rounded-theme-lg border border-border p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-secondary/10 rounded-theme flex items-center justify-center mb-4">
              <Shield className="w-7 h-7 text-secondary" />
            </div>
            <h3 className="font-semibold text-text-primary text-lg">Trust Scores</h3>
            <p className="text-text-secondary text-sm mt-2 leading-relaxed">
              Every product gets a trust score based on genuine reviews and sentiment analysis.
            </p>
          </div>

          <div className="bg-card rounded-theme-lg border border-border p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-accent/10 rounded-theme flex items-center justify-center mb-4">
              <TrendingUp className="w-7 h-7 text-accent" />
            </div>
            <h3 className="font-semibold text-text-primary text-lg">Smart Recommendations</h3>
            <p className="text-text-secondary text-sm mt-2 leading-relaxed">
              Personalized suggestions powered by machine learning and your preferences.
            </p>
          </div>

          <div className="bg-card rounded-theme-lg border border-border p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-success/10 rounded-theme flex items-center justify-center mb-4">
              <BarChart3 className="w-7 h-7 text-success" />
            </div>
            <h3 className="font-semibold text-text-primary text-lg">Feature Analysis</h3>
            <p className="text-text-secondary text-sm mt-2 leading-relaxed">
              Deep dive into product features with aspect-based sentiment analysis.
            </p>
          </div>

          <div className="bg-card rounded-theme-lg border border-border p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-warning/10 rounded-theme flex items-center justify-center mb-4">
              <Clock className="w-7 h-7 text-warning" />
            </div>
            <h3 className="font-semibold text-text-primary text-lg">Real-Time Updates</h3>
            <p className="text-text-secondary text-sm mt-2 leading-relaxed">
              Rankings update dynamically based on the latest customer feedback and reviews.
            </p>
          </div>

          <div className="bg-card rounded-theme-lg border border-border p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-danger/10 rounded-theme flex items-center justify-center mb-4">
              <CheckCircle className="w-7 h-7 text-danger" />
            </div>
            <h3 className="font-semibold text-text-primary text-lg">Fake Review Detection</h3>
            <p className="text-text-secondary text-sm mt-2 leading-relaxed">
              Advanced algorithms identify and filter out fake reviews for authentic feedback.
            </p>
          </div>
        </div>
      </section>

      {/* Trust/Stats Section */}
      <section className="bg-card border-y border-border py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-primary">10,000+</div>
              <p className="text-text-secondary mt-2">Products Analyzed</p>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-secondary">50,000+</div>
              <p className="text-text-secondary mt-2">Reviews Processed</p>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-accent">98.5%</div>
              <p className="text-text-secondary mt-2">Accuracy Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 lg:py-20">
        <div className="bg-primary/5 rounded-theme-xl border border-primary/20 p-8 sm:p-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">
            {isAuthenticated ? 'Continue Your Shopping Journey' : 'Ready to Find Your Perfect Product?'}
          </h2>
          <p className="mt-3 text-text-secondary max-w-2xl mx-auto">
            {isAuthenticated 
              ? 'Explore personalized recommendations and discover products you\'ll love.'
              : 'Join thousands of users who trust Prorasys to help them make better purchasing decisions.'
            }
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white rounded-theme font-medium hover:bg-primary-light hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-1"
                >
                  Browse Products
                  <ShoppingBag className="w-4 h-4" />
                </Link>
                <Link
                  href="/recommendations"
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-card text-text-primary rounded-theme border-2 border-border hover:border-primary transition-all duration-300 hover:-translate-y-1"
                >
                  View AI Picks
                  <Sparkles className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white rounded-theme font-medium hover:bg-primary-light hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-1"
                >
                  Start Exploring
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-card text-text-primary rounded-theme border-2 border-border hover:border-primary transition-all duration-300 hover:-translate-y-1"
                >
                  Get Started
                  <Users className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary inline-block" />
              <span className="font-semibold text-text-primary">Prorasys</span>
              <span className="text-xs text-text-secondary">AI-Powered Discovery</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-text-secondary">
              <Link href="/about" className="hover:text-primary transition-colors">About</Link>
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            </div>
            <p className="text-sm text-text-secondary">
              © {new Date().getFullYear()} Prorasys. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}