'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export function GSAPProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      // Register any GSAP plugins here if needed
      // For now, we're not using ScrollTrigger to avoid issues
      initialized.current = true;
      console.log('✅ GSAP initialized');
    }
  }, []);

  return <>{children}</>;
}