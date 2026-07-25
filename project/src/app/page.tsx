'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Header } from '@/components/commerce/Header';
import { HeroSection } from '@/components/commerce/HeroSection';
import { CategoryStrip } from '@/components/commerce/CategoryStrip';
import { ProductCard } from '@/components/commerce/ProductCard';
import { featuredProducts } from '@/lib/store-data';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HomePage() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        scrollTrigger: { trigger: titleRef.current, start: 'top 80%', toggleActions: 'play none none reverse' },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      });
      const cards = gridRef.current?.querySelectorAll('.product-card');
      if (cards) {
        gsap.from(cards, {
          scrollTrigger: { trigger: gridRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
          opacity: 0,
          y: 40,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(1.7)',
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <main className="min-h-screen bg-surface text-text-primary">
      <Header />
      <HeroSection />
      <CategoryStrip />
      <section ref={sectionRef} className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 lg:px-8">
        <div ref={titleRef} className="mb-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Featured products</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold text-text-primary">Popular right now</h2>
          </div>
          <Link href="/products" className="text-sm text-primary hover:underline flex items-center gap-1 group">
            View all <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </Link>
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