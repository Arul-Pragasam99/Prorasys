'use client';

import { useEffect, useRef, useState } from 'react';
import { Header } from '@/components/commerce/Header';
import { ProductCard } from '@/components/commerce/ProductCard';
import { useStore } from '@/components/commerce/StoreProvider';
import { gsap } from 'gsap';
import { Sparkles, Loader2, RefreshCw, TrendingUp, Star } from 'lucide-react';

export default function RecommendationsPage() {
  const { user, aiRecommendations, loadingRecommendations, getRecommendations } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        ease: 'power3.out',
      });

      const cards = gridRef.current?.querySelectorAll('.rec-card');
      if (cards) {
        gsap.from(cards, {
          opacity: 0,
          y: 40,
          duration: 0.5,
          stagger: 0.1,
          delay: 0.3,
          ease: 'back.out(1.7)',
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [aiRecommendations]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (getRecommendations) await getRecommendations();
    setRefreshing(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
      <Header />
      
      <section ref={sectionRef} className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-16 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-500" />
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">
                AI Powered
              </p>
            </div>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Personalized Recommendations
            </h1>
            <p className="mt-1 text-slate-600">
              {user 
                ? 'AI-generated suggestions based on your browsing and review behavior'
                : 'Sign in to get personalized recommendations'}
            </p>
          </div>
          
          {user && (
            <button
              onClick={handleRefresh}
              disabled={refreshing || loadingRecommendations}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full hover:border-purple-300 hover:text-purple-600 transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          )}
        </div>

        {/* Content */}
        {!user ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-semibold text-slate-700">Sign in for recommendations</h2>
            <p className="text-slate-500 mt-2">Get personalized product suggestions based on your preferences</p>
          </div>
        ) : loadingRecommendations ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            <p className="mt-4 text-slate-500">Generating personalized recommendations...</p>
          </div>
        ) : aiRecommendations && aiRecommendations.length > 0 ? (
          <div ref={gridRef} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {aiRecommendations.map((rec: any, index: number) => (
              <div key={rec.id} className="rec-card">
                <ProductCard 
                  product={rec} 
                  index={index} 
                  showAI={true} 
                  aiScore={rec.recommendation_score || 0.8}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <div className="text-6xl mb-4">🤔</div>
            <h2 className="text-2xl font-semibold text-slate-700">No recommendations yet</h2>
            <p className="text-slate-500 mt-2">Start browsing products and leaving reviews to get personalized suggestions</p>
            <button
              onClick={() => window.location.href = '/products'}
              className="mt-4 px-6 py-2 bg-brand-600 text-white rounded-full hover:bg-brand-700 transition-colors"
            >
              Browse Products
            </button>
          </div>
        )}

        {/* Footer Stats */}
        {user && aiRecommendations && aiRecommendations.length > 0 && (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <p className="text-2xl font-bold text-purple-600">{aiRecommendations.length}</p>
              <p className="text-xs text-slate-500">Recommendations</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <p className="text-2xl font-bold text-emerald-600">92%</p>
              </div>
              <p className="text-xs text-slate-500">Match accuracy</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <p className="text-2xl font-bold text-yellow-600">4.8★</p>
              </div>
              <p className="text-xs text-slate-500">Avg rating</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <p className="text-2xl font-bold text-blue-600">24/7</p>
              <p className="text-xs text-slate-500">AI available</p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}