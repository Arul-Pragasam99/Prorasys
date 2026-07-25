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
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set initial states
    gsap.set(titleRef.current, { opacity: 0, y: 60 });
    gsap.set(subtitleRef.current, { opacity: 0, y: 40 });
    gsap.set(ctaRef.current, { opacity: 0, y: 30 });
    gsap.set(statsRef.current?.children || [], { opacity: 0, y: 30 });
    gsap.set(badgeRef.current, { opacity: 0, scale: 0.9 });

    // Main timeline
    const tl = gsap.timeline({ 
      defaults: { ease: 'power3.out' },
      delay: 0.2,
    });

    // Animate badge first
    tl.to(badgeRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      ease: 'back.out(1.7)',
    })
    // Animate title with bounce effect
    .to(titleRef.current, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'back.out(1.7)',
    }, '-=0.2')
    // Animate subtitle
    .to(subtitleRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power2.out',
    }, '-=0.5')
    // Animate CTA buttons
    .to(ctaRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out',
    }, '-=0.3')
    // Animate stats with stagger
    .to(statsRef.current?.children || [], {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.15,
      ease: 'back.out(1.4)',
    }, '-=0.3');

    // Floating animation for background elements
    gsap.to(floatingRef.current, {
      y: 20,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    // Second floating element with different timing
    const floatingElements = heroRef.current?.querySelectorAll('.floating-bg');
    if (floatingElements) {
      floatingElements.forEach((el, i) => {
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
    }

  }, []);

  return (
    <section 
      ref={heroRef} 
      className="relative min-h-[90vh] flex items-center overflow-hidden pt-16"
      style={{
        background: 'radial-gradient(ellipse at 30% 50%, rgba(15, 110, 86, 0.08) 0%, var(--color-surface) 70%)',
      }}
    >
      {/* Floating background elements */}
      <div className="floating-bg absolute top-20 right-10 lg:right-20 opacity-30">
        <div className="w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
      </div>
      <div className="floating-bg absolute bottom-20 left-10 lg:left-20 opacity-20">
        <div className="w-80 h-80 rounded-full bg-secondary/10 blur-3xl" />
      </div>
      <div ref={floatingRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5">
        <div className="w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            {/* Badge */}
            <div 
              ref={badgeRef}
              className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border shadow-sm opacity-0"
            >
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