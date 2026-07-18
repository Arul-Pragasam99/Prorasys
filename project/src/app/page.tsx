'use client';

import { useEffect, useRef } from 'react';
import { Header } from '@/components/commerce/Header';
import { HeroSection } from '@/components/commerce/HeroSection';
import { CategoryStrip } from '@/components/commerce/CategoryStrip';
import { ProductCard } from '@/components/commerce/ProductCard';
import { featuredProducts } from '@/lib/store-data';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HomePage() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate title section
      gsap.from(titleRef.current, {
        scrollTrigger: {
          trigger: titleRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: 'power3.out',
      });

      // Animate each product card with stagger
      const cards = gridRef.current?.querySelectorAll('.product-card');
      if (cards) {
        gsap.from(cards, {
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
          opacity: 0,
          y: 60,
          duration: 0.6,
          stagger: 0.15,
          ease: 'back.out(1.7)',
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
      <Header />
      <HeroSection />
      <CategoryStrip />
      
      <section ref={sectionRef} className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 lg:px-8">
        <div ref={titleRef} className="mb-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700 animate-pulse">
              Featured products
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold text-slate-900 bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              Popular right now
            </h2>
          </div>
          <span className="text-sm text-slate-500 hover:text-brand-600 transition-colors cursor-pointer group">
            View all 
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </span>
        </div>
        
        <div ref={gridRef} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featuredProducts.map((product, index) => (
            <div key={product.id} className="product-card">
              <ProductCard product={product} index={index} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}