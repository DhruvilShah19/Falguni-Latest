'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Menu, X, Heart, Package, LogOut, ChevronDown, MapPin } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Image from 'next/image';
import { getCoupons } from '@/lib/firestore';
import type { CouponModel } from '@/types';

export default function Header() {
  const router   = useRouter();
  const pathname = usePathname();
  const { totalQuantity } = useCartStore();
  const { firebaseUser, userDoc } = useAuthStore();
  const [menuOpen, setMenuOpen]   = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const [userMenu, setUserMenu]   = useState(false);
  const [promoCoupon, setPromoCoupon] = useState<CouponModel | null>(null);

  const cartCount = totalQuantity();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    
    getCoupons(1).then(c => {
      if (c && c.length > 0) setPromoCoupon(c[0]);
    }).catch(e => console.error(e));

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => { setMenuOpen(false); setUserMenu(false); }, [pathname]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  const navLinks = [
    { href: '/',            label: 'Home' },
    { href: '/categories',  label: 'Categories' },
    { href: '/products',    label: 'Products' },
    ...(firebaseUser ? [{ href: '/orders', label: 'Orders' }] : []),
  ];

  return (
    <>
      {/* ── Premium Announcement bar ── */}
      <div
        className="hidden md:flex items-center justify-center gap-6 py-2.5 text-[10px] md:text-xs font-bold tracking-[0.2em] text-[#D4AF37] uppercase bg-[#1a100e]"
      >
        <span className="flex items-center gap-2"><span className="text-white opacity-50">✨</span> Welcome to our brand new Web App!</span>
        {promoCoupon && (
          <>
            <span className="opacity-20 text-white">|</span>
            <span className="flex items-center gap-2"><span className="text-white opacity-50">🎉</span> Use code <span className="text-white bg-[#D4AF37]/20 px-2.5 py-0.5 rounded-md border border-[#D4AF37]/30 shadow-[0_0_10px_rgba(212,175,55,0.2)]">{promoCoupon.coupon}</span> {promoCoupon.percentage > 0 ? `for ${promoCoupon.percentage}% OFF` : ''}</span>
          </>
        )}
      </div>

      {/* ── Main header ── */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 border-b ${
          scrolled 
            ? 'bg-[#2B1B17]/95 backdrop-blur-xl border-[#D4AF37]/20 shadow-xl' 
            : 'bg-[#2B1B17]/80 backdrop-blur-lg border-white/5'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-4 md:gap-8">

          {/* ── Left Section: Logo & Global Address ── */}
          <div className="flex items-center gap-4 md:gap-6 lg:gap-8 flex-shrink-0">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-3 group">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl overflow-hidden flex-shrink-0 border border-[#D4AF37]/30 group-hover:border-[#D4AF37] transition-colors shadow-lg">
                <Image src="/logo.png" alt="Falguni" width={48} height={48} className="object-cover" />
              </div>
              <div className="hidden sm:flex flex-col leading-none">
                <span className="font-serif text-[#D4AF37] text-lg md:text-xl font-bold tracking-wide">Falguni</span>
                <span className="text-white/60 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase mt-0.5">Gruh Udhyog</span>
              </div>
            </Link>

            {/* Global Delivery Address Indicator (Ultra-Minimalist PIN View) */}
            <div className="flex items-center gap-3 md:gap-5">
              <div className="h-6 w-px bg-white/10 hidden md:block" />
              <Link
                href={firebaseUser ? (userDoc?.DeliveryAddress ? "/profile/addresses" : "/profile/addresses/add") : "/login"}
                className="flex flex-col justify-center group py-1"
              >
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-[#D4AF37] shrink-0 group-hover:-translate-y-0.5 transition-transform" />
                  <span className="text-sm md:text-base font-serif italic tracking-[0.15em] text-white group-hover:text-[#D4AF37] transition-colors drop-shadow-md">
                    {(() => {
                      if (!userDoc?.DeliveryAddress) return 'Set Location';
                      const match = userDoc.DeliveryAddress.match(/\b\d{6}\b/);
                      if (match) return match[0];
                      const parts = userDoc.DeliveryAddress.split(',');
                      return parts.length > 1 ? parts[parts.length - 2].trim() : 'Location Set';
                    })()}
                  </span>
                  <ChevronDown size={14} className="text-[#D4AF37]/50 shrink-0 group-hover:translate-y-0.5 transition-transform ml-1" />
                </div>
                {userDoc?.DeliveryAddress && (
                  <span className="text-[7px] md:text-[8px] font-bold text-white/40 tracking-[0.25em] uppercase mt-0.5 ml-6 group-hover:text-[#D4AF37]/80 transition-colors">
                    Click to view full address
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* ── Desktop nav links ── */}
          <nav className="hidden lg:flex items-center gap-2">
            {navLinks.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-4 py-2 rounded-xl text-sm font-bold tracking-wide transition-all ${
                    active
                      ? 'text-[#2B1B17] bg-[#D4AF37]'
                      : 'text-white/70 hover:text-[#D4AF37] hover:bg-white/5'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex-1 hidden lg:flex" />

          {/* ── Right icons ── */}
          <div className="flex items-center gap-2">

            {/* Search */}
            <Link
              href="/search"
              className="p-2.5 md:p-3 rounded-2xl text-white/70 hover:text-[#D4AF37] hover:bg-white/5 transition-all"
            >
              <Search size={22} />
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2.5 md:p-3 rounded-2xl text-white/70 hover:text-[#D4AF37] hover:bg-white/5 transition-all"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span
                  className="absolute top-1.5 right-1.5 w-4.5 h-4.5 rounded-full text-[10px] font-black flex items-center justify-center animate-pulse-gold shadow-lg"
                  style={{ background: '#D4AF37', color: '#1a100e' }}
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* Wishlist */}
            <Link
              href="/favorites"
              className="p-2.5 md:p-3 rounded-2xl text-white/70 hover:text-[#D4AF37] hover:bg-white/5 transition-all"
            >
              <Heart size={22} />
            </Link>

            {/* User (desktop) */}
            {firebaseUser ? (
              <div className="hidden md:block relative">
                <button
                  onClick={() => setUserMenu(v => !v)}
                  className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-2xl text-white/80 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black bg-gradient-to-br from-[#D4AF37] to-[#B8952A] text-[#1a100e] shadow-md">
                    {(userDoc?.fullname || firebaseUser.displayName || 'U').charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${userMenu ? 'rotate-180 text-[#D4AF37]' : 'text-white/40'}`} />
                </button>

                {/* Dropdown */}
                {userMenu && (
                  <div className="absolute right-0 top-full mt-3 w-56 rounded-2xl overflow-hidden shadow-2xl z-50 py-2 bg-[#1a100e] border border-[#D4AF37]/20 backdrop-blur-xl animate-fade-up">
                    <DropItem href="/profile"   icon={<User    size={16} />} label="My Profile" />
                    <DropItem href="/orders"    icon={<Package size={16} />} label="My Orders" />
                    <DropItem href="/favorites" icon={<Heart   size={16} />} label="Favourites" />
                    <div className="h-px mx-4 my-2 bg-white/10" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 w-full px-5 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all btn-gold ml-2"
              >
                Sign In
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="md:hidden p-2.5 rounded-xl text-white/70 hover:text-[#D4AF37] hover:bg-white/5 transition-all ml-1"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* ── Mobile menu dropdown ── */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 px-5 py-6 flex flex-col gap-2 shadow-2xl bg-[#1a100e]/95 backdrop-blur-2xl absolute w-full left-0 animate-fade-in">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href}
                className="py-3.5 px-4 rounded-xl text-sm font-bold tracking-wide text-white/70 hover:text-[#D4AF37] hover:bg-white/5 transition-all">
                {label}
              </Link>
            ))}
            {!firebaseUser ? (
              <Link href="/login" className="mt-4 text-center py-3.5 rounded-xl text-sm font-bold btn-gold mx-2">
                Sign In
              </Link>
            ) : (
              <button onClick={handleSignOut} className="mt-4 py-3.5 px-4 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all text-left mx-2">
                Sign Out
              </button>
            )}
          </div>
        )}
      </header>
    </>
  );
}

function DropItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href}
      className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-white/70 hover:text-[#D4AF37] hover:bg-white/5 transition-all">
      <span className="text-white/40 group-hover:text-[#D4AF37] transition-colors">{icon}</span>
      {label}
    </Link>
  );
}
