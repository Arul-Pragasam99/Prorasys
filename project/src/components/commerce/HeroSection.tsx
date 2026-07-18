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
  const floatingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance animation
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      
      tl.from(heroRef.current, {
        opacity: 0,
        duration: 0.6,
      })
      .from(titleRef.current, {
        opacity: 0,
        y: 80,
        duration: 1,
        ease: 'back.out(1.7)',
      }, '-=0.3')
      .from(subtitleRef.current, {
        opacity: 0,
        y: 40,
        duration: 0.8,
      }, '-=0.5')
      .from(ctaRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.6,
      }, '-=0.3')
      .from(statsRef.current?.children || [], {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.15,
      }, '-=0.2');

      // Floating elements animation
      gsap.to(floatingRef.current, {
        y: 20,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Parallax effect on scroll
      gsap.to(heroRef.current, {
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
        y: -50,
        opacity: 0.8,
      });

    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={heroRef} 
      className="relative bg-gradient-to-br from-brand-50 via-white to-blue-50/50 overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
      </div>

      {/* Floating Elements */}
      <div ref={floatingRef} className="absolute top-20 right-10 lg:right-20 opacity-30">
        <div className="w-32 h-32 rounded-full bg-gradient-to-r from-brand-300 to-blue-300 blur-3xl" />
      </div>
      <div className="absolute bottom-20 left-10 lg:left-20 opacity-20">
        <div className="w-40 h-40 rounded-full bg-gradient-to-r from-purple-300 to-pink-300 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-slate-200/50">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span className="text-sm font-medium text-slate-700">
                AI-Powered Shopping Experience
              </span>
            </div>

            <h1 
              ref={titleRef}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight"
            >
              Discover Products
              <span className="block bg-gradient-to-r from-brand-600 to-blue-600 bg-clip-text text-transparent">
                You'll Love
              </span>
            </h1>

            <p 
              ref={subtitleRef}
              className="text-lg sm:text-xl text-slate-600 max-w-lg leading-relaxed"
            >
              AI-powered recommendations, trust scores, and personalized shopping 
              experiences. Join thousands of satisfied customers.
            </p>

            <div ref={ctaRef} className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-full hover:shadow-lg hover:shadow-brand-200 transition-all duration-300 hover:-translate-y-1"
              >
                Start Shopping
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/recommendations"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-slate-700 rounded-full border border-slate-200 hover:border-brand-300 hover:text-brand-700 transition-all duration-300 hover:-translate-y-1"
              >
                Get Recommendations
                <Zap className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div ref={statsRef} className="grid grid-cols-2 gap-4">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-200/50 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <p className="text-3xl font-bold text-brand-600">10K+</p>
              <p className="text-sm text-slate-600 mt-1">Happy Customers</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-200/50 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <p className="text-3xl font-bold text-blue-600">4.8★</p>
              <p className="text-sm text-slate-600 mt-1">Average Rating</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-200/50 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <p className="text-3xl font-bold text-purple-600">95%</p>
              <p className="text-sm text-slate-600 mt-1">Trust Score</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-200/50 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <p className="text-3xl font-bold text-emerald-600">24/7</p>
              <p className="text-sm text-slate-600 mt-1">AI Support</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}