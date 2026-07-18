'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/components/commerce/StoreProvider';
import { gsap } from 'gsap';
import { Menu, X, ShoppingCart, Heart, User, LogOut, Home, Package, Sparkles } from 'lucide-react';

export function Header() {
  const { cart, wishlist, isAuthenticated, userRole, logout } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    // Header animation
    gsap.from(headerRef.current, {
      y: -100,
      duration: 0.6,
      ease: 'power3.out',
    });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Mobile menu animation
    if (isMenuOpen) {
      gsap.from(mobileMenuRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  }, [isMenuOpen]);

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/products', label: 'Products', icon: Package },
    { href: '/recommendations', label: 'AI Picks', icon: Sparkles },
  ];

  return (
    <header 
      ref={headerRef}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-slate-200/50' 
          : 'bg-white/90 backdrop-blur border-b border-slate-200'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-slate-900 hover:text-brand-600 transition-colors group"
        >
          <span className="bg-gradient-to-r from-brand-600 to-blue-600 w-2 h-2 sm:w-3 sm:h-3 rounded-full inline-block group-hover:scale-150 transition-transform" />
          <span>Prorasys</span>
          <span className="text-xs font-normal text-slate-400 hidden sm:inline">Store</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium text-slate-600">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-brand-700 transition-all duration-200 hover:scale-105"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Cart Count */}
          <Link 
            href="/cart" 
            className="relative group p-2 rounded-full hover:bg-slate-100 transition-all duration-200 hover:scale-110"
          >
            <ShoppingCart className="w-5 h-5 text-slate-600 group-hover:text-brand-600 transition-colors" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white animate-pulse">
                {cart.length}
              </span>
            )}
          </Link>

          {/* Wishlist */}
          <Link 
            href="/cart#wishlist" 
            className="relative group p-2 rounded-full hover:bg-slate-100 transition-all duration-200 hover:scale-110"
          >
            <Heart className="w-5 h-5 text-slate-600 group-hover:text-red-500 transition-colors" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Auth */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-sm text-slate-600">
                {userRole === 'admin' ? '👑 Admin' : '👤 User'}
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-slate-900 text-white hover:bg-slate-700 transition-all duration-200 hover:scale-105 text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:shadow-lg hover:shadow-brand-200 transition-all duration-200 hover:scale-105 text-sm"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-full hover:bg-slate-100 transition-all duration-200"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-slate-600" />
            ) : (
              <Menu className="w-6 h-6 text-slate-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="md:hidden bg-white border-t border-slate-200 shadow-lg"
        >
          <div className="px-4 py-4 space-y-2">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-all duration-200"
              >
                <Icon className="w-5 h-5 text-slate-400" />
                <span className="font-medium text-slate-700">{label}</span>
              </Link>
            ))}
            
            {/* Mobile Auth */}
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-slate-50 transition-all duration-200"
              >
                <LogOut className="w-5 h-5 text-slate-400" />
                <span className="font-medium text-slate-700">Logout</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-brand-50 hover:bg-brand-100 transition-all duration-200"
              >
                <User className="w-5 h-5 text-brand-600" />
                <span className="font-medium text-brand-700">Sign In</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}