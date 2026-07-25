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
  ChevronDown,
  Settings,
  UserCircle,
  Shield,
  Crown
} from 'lucide-react';

export function Header() {
  const { cart, wishlist, isAuthenticated, userRole, user, logout } = useStore();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get user display name
  const displayName = user?.displayName || 'User';
  const userEmail = user?.email || '';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    // Set initial position before animation
    gsap.set(headerRef.current, { 
      y: -100,
      opacity: 0 
    });

    // Animate to visible position
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/products', label: 'Products', icon: Package },
    { href: '/recommendations', label: 'AI Picks', icon: Sparkles },
  ];

  // Get user role badge
  const getRoleBadge = () => {
    if (userRole === 'admin') {
      return { label: 'Admin', icon: Crown, color: 'bg-primary text-white' };
    }
    return { label: 'Customer', icon: User, color: 'bg-secondary text-white' };
  };

  const roleInfo = getRoleBadge();
  const RoleIcon = roleInfo.icon;

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-[99999] transition-all duration-500 ${
        isScrolled
          ? 'bg-surface/95 backdrop-blur-xl shadow-lg border-b border-border'
          : 'bg-surface/90 backdrop-blur border-b border-border/50'
      }`}
      style={{
        visibility: 'visible',
        opacity: 1,
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-2.5 text-xl sm:text-2xl font-bold group flex-shrink-0"
        >
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
        <div className="flex items-center gap-1 sm:gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-theme hover:bg-card transition-colors relative"
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
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-lg">
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
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white shadow-lg">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Auth Section */}
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-theme hover:bg-card transition-all duration-200 group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-text-primary leading-tight">
                      {displayName}
                    </p>
                    <span className={`text-xs font-medium ${roleInfo.color} px-1.5 py-0.5 rounded-full inline-flex items-center gap-1`}>
                      <RoleIcon className="w-3 h-3" />
                      {roleInfo.label}
                    </span>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-card rounded-theme-lg border border-border shadow-lg overflow-hidden animate-fade-in">
                  <div className="p-3 border-b border-border">
                    <p className="font-medium text-text-primary">{displayName}</p>
                    <p className="text-xs text-text-secondary truncate">{userEmail}</p>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${roleInfo.color} px-2 py-0.5 rounded-full mt-1`}>
                      <RoleIcon className="w-3 h-3" />
                      {roleInfo.label}
                    </span>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-card hover:text-primary transition-all duration-200"
                    >
                      <UserCircle className="w-4 h-4" />
                      My Profile
                    </Link>
                    {userRole === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-card hover:text-primary transition-all duration-200"
                      >
                        <Shield className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href="/settings"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-card hover:text-primary transition-all duration-200"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={() => { logout(); setIsDropdownOpen(false); }}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger/10 w-full transition-all duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-theme bg-primary text-white hover:bg-primary-light shadow-lg shadow-primary/20 transition-all duration-200 text-sm hover:scale-105"
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
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu md:hidden bg-surface border-t border-border shadow-xl animate-fade-in">
          <div className="px-4 py-4 space-y-2 max-h-[80vh] overflow-y-auto">
            {/* User Info in Mobile Menu */}
            {isAuthenticated && (
              <div className="flex items-center gap-3 px-4 py-3 bg-card rounded-theme border border-border mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary truncate">{displayName}</p>
                  <span className={`text-xs font-medium ${roleInfo.color} px-1.5 py-0.5 rounded-full inline-flex items-center gap-1`}>
                    <RoleIcon className="w-3 h-3" />
                    {roleInfo.label}
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
              {isAuthenticated ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-theme hover:bg-card transition-all duration-200"
                  >
                    <UserCircle className="w-5 h-5 text-text-secondary" />
                    <span className="font-medium text-text-primary">My Profile</span>
                  </Link>
                  {userRole === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-theme hover:bg-card transition-all duration-200"
                    >
                      <Shield className="w-5 h-5 text-text-secondary" />
                      <span className="font-medium text-text-primary">Admin Dashboard</span>
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-theme hover:bg-danger/10 transition-all duration-200"
                  >
                    <LogOut className="w-5 h-5 text-danger" />
                    <span className="font-medium text-danger">Logout</span>
                  </button>
                </>
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
        </div>
      )}
    </header>
  );
}