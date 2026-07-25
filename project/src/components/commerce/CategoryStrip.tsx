'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { Smartphone, Laptop, Headphones, Watch, Camera, Tablet, Monitor, Printer } from 'lucide-react';

const categories = [
  { name: 'Electronics', icon: Laptop, color: 'bg-primary' },
  { name: 'Phones', icon: Smartphone, color: 'bg-secondary' },
  { name: 'Audio', icon: Headphones, color: 'bg-accent' },
  { name: 'Wearables', icon: Watch, color: 'bg-success' },
  { name: 'Cameras', icon: Camera, color: 'bg-warning' },
  { name: 'Tablets', icon: Tablet, color: 'bg-primary/80' },
  { name: 'Monitors', icon: Monitor, color: 'bg-secondary/80' },
  { name: 'Printers', icon: Printer, color: 'bg-card' },
];

export function CategoryStrip() {
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const items = stripRef.current?.children;
    if (items) {
      gsap.set(items, { opacity: 0, y: 20 });
      
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: 'power2.out',
        delay: 0.6,
      });
    }
  }, []);

  return (
    <div className="bg-card border-y border-border py-4 sm:py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div ref={stripRef} className="flex flex-wrap justify-center gap-2 sm:gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                href={`/products?category=${category.name.toLowerCase()}`}
                className="group flex flex-col items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-theme hover:bg-surface transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`p-2 sm:p-3 rounded-theme ${category.color} text-white shadow-sm group-hover:shadow-md transition-all duration-300`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-text-secondary group-hover:text-primary transition-colors">
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