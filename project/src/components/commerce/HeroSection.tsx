'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ArrowRight, Sparkles, Zap, Shield, Star } from 'lucide-react';

export function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Main timeline
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      
      tl.from(heroRef.current, { opacity: 0, duration: 0.8 })
        .from(titleRef.current, { 
          opacity: 0, 
          y: 60, 
          duration: 1.2, 
          ease: 'back.out(1.7)' 
        }, '-=0.4')
        .from(subtitleRef.current, { 
          opacity: 0, 
          y: 30, 
          duration: 0.8 
        }, '-=0.6')
        .from(ctaRef.current, { 
          opacity: 0, 
          y: 20, 
          duration: 0.6 
        }, '-=0.4')
        .from(statsRef.current?.children || [], {
          opacity: 0,
          y: 30,
          duration: 0.6,
          stagger: 0.12,
        }, '-=0.3');

      // Floating animation
      gsap.to(floatingRef.current, {
        y: 20,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Parallax effect
      gsap.to(heroRef.current, {
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
        y: -30,
        opacity: 0.9,
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={heroRef} 
      className="relative min-h-[90vh] flex items-center overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 30% 50%, var(--color-primary)/5 0%, var(--color-surface) 70%)',
      }}
    >
      {/* Floating elements */}
      <div ref={floatingRef} className="absolute top-20 right-10 lg:right-20 opacity-30">
        <div className="w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
      </div>
      <div className="absolute bottom-20 left-10 lg:left-20 opacity-20">
        <div className="w-80 h-80 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border shadow-sm animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-text-secondary">
                AI-Powered Shopping Experience
              </span>
            </div>

            <h1 
              ref={titleRef}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold text-text-primary leading-[1.1]"
            >
              Discover Products
              <span className="block text-primary mt-2">
                You'll Love
              </span>
            </h1>

            <p ref={subtitleRef} className="text-lg sm:text-xl text-text-secondary max-w-lg leading-relaxed">
              AI-powered recommendations, trust scores, and personalized shopping experiences 
              — all designed to help you find exactly what you need.
            </p>

            <div ref={ctaRef} className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white rounded-theme font-medium hover:bg-primary-light hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-1"
              >
                Start Shopping
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/recommendations"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-card text-text-primary rounded-theme border-2 border-border hover:border-primary hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                Get Recommendations
                <Zap className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div ref={statsRef} className="grid grid-cols-2 gap-4">
            <div className="bg-card/80 backdrop-blur-sm p-6 rounded-theme-lg border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-theme group-hover:scale-110 transition-transform">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">10K+</p>
                  <p className="text-sm text-text-secondary">Happy Customers</p>
                </div>
              </div>
            </div>
            <div className="bg-card/80 backdrop-blur-sm p-6 rounded-theme-lg border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-theme group-hover:scale-110 transition-transform">
                  <Star className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-secondary">4.8★</p>
                  <p className="text-sm text-text-secondary">Average Rating</p>
                </div>
              </div>
            </div>
            <div className="bg-card/80 backdrop-blur-sm p-6 rounded-theme-lg border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-theme group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-accent">95%</p>
                  <p className="text-sm text-text-secondary">Trust Score</p>
                </div>
              </div>
            </div>
            <div className="bg-card/80 backdrop-blur-sm p-6 rounded-theme-lg border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-theme group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-success">24/7</p>
                  <p className="text-sm text-text-secondary">AI Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}