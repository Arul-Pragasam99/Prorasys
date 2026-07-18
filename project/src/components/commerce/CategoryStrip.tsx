'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { 
  Smartphone, 
  Laptop, 
  Headphones, 
  Watch, 
  Camera, 
  Tablet, 
  Monitor, 
  Printer 
} from 'lucide-react';

const categories = [
  { name: 'Electronics', icon: Laptop, color: 'from-blue-500 to-cyan-400' },
  { name: 'Phones', icon: Smartphone, color: 'from-purple-500 to-pink-400' },
  { name: 'Audio', icon: Headphones, color: 'from-emerald-500 to-teal-400' },
  { name: 'Wearables', icon: Watch, color: 'from-orange-500 to-red-400' },
  { name: 'Cameras', icon: Camera, color: 'from-indigo-500 to-blue-400' },
  { name: 'Tablets', icon: Tablet, color: 'from-rose-500 to-pink-400' },
  { name: 'Monitors', icon: Monitor, color: 'from-cyan-500 to-blue-400' },
  { name: 'Printers', icon: Printer, color: 'from-slate-500 to-gray-400' },
];

export function CategoryStrip() {
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(stripRef.current?.children || [], {
        scrollTrigger: {
          trigger: stripRef.current,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0,
        y: 40,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
      });
    }, stripRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-white/80 backdrop-blur-sm border-y border-slate-200/50 py-4 sm:py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div 
          ref={stripRef}
          className="flex flex-wrap justify-center gap-2 sm:gap-4"
        >
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                href={`/products?category=${category.name.toLowerCase()}`}
                className="group flex flex-col items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-xl hover:bg-slate-50 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className={`p-2 sm:p-3 rounded-full bg-gradient-to-r ${category.color} text-white shadow-md group-hover:shadow-lg transition-all duration-300`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-slate-600 group-hover:text-brand-600 transition-colors">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}