'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';

export function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      
      tl.from(heroRef.current, { opacity: 0, duration: 0.6 })
        .from(titleRef.current, { opacity: 0, y: 60, duration: 1, ease: 'back.out(1.7)' }, '-=0.3')
        .from(subtitleRef.current, { opacity: 0, y: 30, duration: 0.8 }, '-=0.5')
        .from(ctaRef.current, { opacity: 0, y: 20, duration: 0.6 }, '-=0.3')
        .from(statsRef.current?.children || [], {
          opacity: 0,
          y: 20,
          duration: 0.5,
          stagger: 0.1,
        }, '-=0.2');
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative bg-gradient-to-br from-primary/5 via-surface to-secondary/5 overflow-hidden py-20 sm:py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-card px-4 py-2 rounded-theme border border-border">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-text-secondary">AI-Powered Shopping Experience</span>
            </div>

            <h1 ref={titleRef} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary leading-tight">
              Discover Products
              <span className="block text-primary">You'll Love</span>
            </h1>

            <p ref={subtitleRef} className="text-lg sm:text-xl text-text-secondary max-w-lg leading-relaxed">
              AI-powered recommendations, trust scores, and personalized shopping experiences.
            </p>

            <div ref={ctaRef} className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white rounded-theme hover:bg-primary-light transition-all duration-300 hover:-translate-y-1"
              >
                Start Shopping
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/recommendations"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-card text-text-primary rounded-theme border border-border hover:border-primary transition-all duration-300 hover:-translate-y-1"
              >
                Get Recommendations
                <Zap className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div ref={statsRef} className="grid grid-cols-2 gap-4">
            <div className="bg-card p-6 rounded-theme-lg border border-border hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <p className="text-3xl font-bold text-primary">10K+</p>
              <p className="text-sm text-text-secondary mt-1">Happy Customers</p>
            </div>
            <div className="bg-card p-6 rounded-theme-lg border border-border hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <p className="text-3xl font-bold text-secondary">4.8★</p>
              <p className="text-sm text-text-secondary mt-1">Average Rating</p>
            </div>
            <div className="bg-card p-6 rounded-theme-lg border border-border hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <p className="text-3xl font-bold text-accent">95%</p>
              <p className="text-sm text-text-secondary mt-1">Trust Score</p>
            </div>
            <div className="bg-card p-6 rounded-theme-lg border border-border hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <p className="text-3xl font-bold text-success">24/7</p>
              <p className="text-sm text-text-secondary mt-1">AI Support</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}