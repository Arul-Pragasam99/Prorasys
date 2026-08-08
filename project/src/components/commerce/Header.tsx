'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { useStore } from '@/components/commerce/StoreProvider';
import { gsap } from 'gsap';
import { 
  Menu, 
  X, 
  ShoppingBag, 
  Heart, 
  User, 
  LogOut, 
  Home, 
  Package, 
  Sparkles, 
  Sun, 
  Moon,
  Package as OrdersIcon
} from 'lucide-react';

export function Header() {
  const { cart, wishlist, isAuthenticated, userRole, user, logout } = useStore();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // Get user display name
  const displayName = user?.displayName || 'User';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    gsap.set(headerRef.current, { y: -100, opacity: 0 });
    gsap.to(headerRef.current, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out',
      delay: 0.1,
    });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      gsap.from('.mobile-menu', {
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
    { href: '/orders', label: 'Orders', icon: OrdersIcon },
  ];

  // Navbar uses the site's theme tokens (--color-surface / --color-border)
  // defined in globals.css, so it automatically matches light/dark mode
  // the same way the rest of the site does — no dark: overrides needed.
  const bgClasses = isScrolled
    ? 'bg-surface shadow-lg border-b border-border'
    : 'bg-surface border-b border-border/50';

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-[99999] transition-all duration-500 ${bgClasses}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 text-xl sm:text-2xl font-bold group">
          <div className="relative">
            <div className="absolute inset-0 bg-primary blur-xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full" />
            <span className="relative w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-primary inline-block" />
          </div>
          <span className="text-text-primary">Prorasys</span>
          <span className="text-xs font-medium text-text-secondary bg-card px-2 py-0.5 rounded-full border border-border hidden sm:inline-block">
            AI
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 px-4 py-2 rounded-theme text-sm font-medium text-text-secondary hover:bg-card hover:text-primary transition-all duration-200 group"
            >
              <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-theme hover:bg-card transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-text-secondary" />
            ) : (
              <Sun className="w-5 h-5 text-text-secondary" />
            )}
          </button>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative group p-2 rounded-theme hover:bg-card transition-all duration-200"
            aria-label="Cart"
          >
            <ShoppingBag className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold shadow-lg animate-pulse">
                {cart.length}
              </span>
            )}
          </Link>

          {/* Wishlist */}
          <Link
            href="/cart#wishlist"
            className="relative group p-2 rounded-theme hover:bg-card transition-all duration-200"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5 text-text-secondary group-hover:text-accent transition-colors" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white text-[10px] font-bold shadow-lg">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Auth */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-text-primary leading-tight">
                    {displayName}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {userRole === 'admin' ? 'Admin' : 'Customer'}
                  </span>
                </div>
              </div>
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

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-theme hover:bg-card transition-all duration-200"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6 text-text-secondary" /> : <Menu className="w-6 h-6 text-text-secondary" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu md:hidden bg-surface border-t border-border shadow-xl">
          <div className="px-4 py-4 space-y-2">
            {/* User Info in Mobile Menu */}
            {isAuthenticated && (
              <div className="flex items-center gap-3 px-4 py-3 bg-card rounded-theme border border-border mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary truncate">{displayName}</p>
                  <span className="text-xs text-text-secondary">
                    {userRole === 'admin' ? 'Admin' : 'Customer'}
                  </span>
                </div>
              </div>
            )}

            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-theme hover:bg-card transition-all duration-200 group"
              >
                <Icon className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" />
                <span className="font-medium text-text-primary">{label}</span>
              </Link>
            ))}
            
            <div className="border-t border-border my-2 pt-2">
              {/* Mobile Theme Toggle */}
              <button
                onClick={() => { toggleTheme(); setIsMenuOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 w-full rounded-theme hover:bg-card transition-all duration-200"
              >
                {theme === 'light' ? <Moon className="w-5 h-5 text-text-secondary" /> : <Sun className="w-5 h-5 text-text-secondary" />}
                <span className="font-medium text-text-primary">
                  {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </span>
              </button>

              {/* Mobile Auth */}
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
            </div>
          </div>
        </div>
      )}
    </header>
  );
}