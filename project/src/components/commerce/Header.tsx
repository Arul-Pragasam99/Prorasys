'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { useStore } from '@/components/commerce/StoreProvider';
import { gsap } from 'gsap';
import { Menu, X, ShoppingCart, Heart, User, LogOut, Home, Package, Sparkles, Sun, Moon } from 'lucide-react';

export function Header() {
  const { cart, wishlist, isAuthenticated, userRole, logout } = useStore();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    gsap.from(headerRef.current, { y: -100, duration: 0.6, ease: 'power3.out' });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      gsap.from(mobileMenuRef.current, { opacity: 0, y: -20, duration: 0.3, ease: 'power2.out' });
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
          ? 'bg-surface/95 backdrop-blur-lg shadow-sm border-b border-border'
          : 'bg-surface/90 backdrop-blur border-b border-border'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <Link href="/" className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-primary group">
          <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-primary inline-block group-hover:scale-150 transition-transform" />
          <span>Prorasys</span>
          <span className="text-xs font-normal text-text-secondary hidden sm:inline">Store</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium text-text-secondary">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 px-3 py-2 rounded-theme hover:bg-card hover:text-primary transition-all duration-200"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-theme hover:bg-card transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          <Link href="/cart" className="relative group p-2 rounded-theme hover:bg-card transition-all duration-200">
            <ShoppingCart className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {cart.length}
              </span>
            )}
          </Link>

          <Link href="/cart#wishlist" className="relative group p-2 rounded-theme hover:bg-card transition-all duration-200">
            <Heart className="w-5 h-5 text-text-secondary group-hover:text-accent transition-colors" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                {wishlist.length}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-sm text-text-secondary">
                {userRole === 'admin' ? '👑 Admin' : '👤 User'}
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-theme bg-primary text-white hover:bg-primary-light transition-all duration-200 text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-theme bg-primary text-white hover:bg-primary-light transition-all duration-200 text-sm"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          )}

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-theme hover:bg-card transition-all duration-200"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div ref={mobileMenuRef} className="md:hidden bg-surface border-t border-border shadow-lg">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-theme hover:bg-card transition-all duration-200"
              >
                <Icon className="w-5 h-5 text-text-secondary" />
                <span className="font-medium text-text-primary">{label}</span>
              </Link>
            ))}
            {isAuthenticated ? (
              <button
                onClick={() => { logout(); setIsMenuOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 w-full rounded-theme hover:bg-card transition-all duration-200"
              >
                <LogOut className="w-5 h-5 text-text-secondary" />
                <span className="font-medium text-text-primary">Logout</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-theme bg-primary/10 hover:bg-primary/20 transition-all duration-200"
              >
                <User className="w-5 h-5 text-primary" />
                <span className="font-medium text-primary">Sign In</span>
              </Link>
            )}
            <button
              onClick={() => { toggleTheme(); setIsMenuOpen(false); }}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-theme hover:bg-card transition-all duration-200"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <span className="font-medium text-text-primary">
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}