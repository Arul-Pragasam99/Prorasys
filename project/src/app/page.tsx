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
import { Sparkles, TrendingUp, Star, Clock } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HomePage() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate title
      gsap.from(titleRef.current, {
        scrollTrigger: {
          trigger: titleRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      });

      // Animate product cards with stagger
      const cards = gridRef.current?.querySelectorAll('.product-card');
      if (cards) {
        gsap.from(cards, {
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
          opacity: 0,
          y: 50,
          duration: 0.7,
          stagger: 0.08,
          ease: 'back.out(1.7)',
        });
      }

      // Animate features section
      const features = featuresRef.current?.querySelectorAll('.feature-item');
      if (features) {
        gsap.from(features, {
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
          opacity: 0,
          y: 30,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
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
      
      <section ref={sectionRef} className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 lg:pb-20">
        <div ref={titleRef} className="mb-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Featured Products</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-text-primary">
              Popular Right Now
            </h2>
          </div>
          <Link href="/products" className="group flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            View all 
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <div ref={gridRef} className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featuredProducts.map((product, index) => (
            <div key={product.id} className="product-card">
              <ProductCard product={product} index={index} showAI={true} aiScore={0.85} />
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div ref={featuresRef} className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="feature-item bg-card rounded-theme-lg border border-border p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-primary/10 rounded-theme flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-semibold text-text-primary text-lg">AI-Powered Trust</h3>
            <p className="text-text-secondary text-sm mt-2 leading-relaxed">
              Every product gets a trust score based on real reviews and sentiment analysis
            </p>
          </div>
          <div className="feature-item bg-card rounded-theme-lg border border-border p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-secondary/10 rounded-theme flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-7 h-7 text-secondary" />
            </div>
            <h3 className="font-semibold text-text-primary text-lg">Smart Recommendations</h3>
            <p className="text-text-secondary text-sm mt-2 leading-relaxed">
              Personalized product suggestions powered by machine learning
            </p>
          </div>
          <div className="feature-item bg-card rounded-theme-lg border border-border p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-accent/10 rounded-theme flex items-center justify-center mx-auto mb-4">
              <Star className="w-7 h-7 text-accent" />
            </div>
            <h3 className="font-semibold text-text-primary text-lg">Verified Reviews</h3>
            <p className="text-text-secondary text-sm mt-2 leading-relaxed">
              Sentiment analysis ensures authentic and trustworthy reviews
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}