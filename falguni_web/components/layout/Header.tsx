'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, ShoppingBag, User, Menu, X, Heart, Package, LogOut, ChevronDown, ChevronRight, Bell } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useStoreStatusStore } from '@/store/storeStatusStore';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Image from 'next/image';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { totalQuantity } = useCartStore();
  const { firebaseUser, userDoc } = useAuthStore();
  const { isOpen, closedMessage, openTime, loading: storeStatusLoading } = useStoreStatusStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [shopDropdown, setShopDropdown] = useState(false);

  const cartCount = totalQuantity();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setUserMenu(false);
    setShopDropdown(false);
  }, [pathname]);

  // Sync search input with URL on route change or when on search page
  useEffect(() => {
    if (pathname === '/search' && typeof window !== 'undefined') {
      const q = new URLSearchParams(window.location.search).get('q') || '';
      setSearchQuery(q);
    }
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMenuOpen(false);
    }
  };

  const navLinks = [
    { href: '/products', label: 'Shop All', hasDropdown: true },
    { href: '/categories', label: 'Categories' },
    { href: '/collections', label: 'Collections' },
    { href: '/products?sort=bestseller', label: 'Bestsellers' },
    { href: '/categories/COMBOS%20%26%20GIFT%20PACKS', label: 'Combos' },
    { href: '/coupon', label: 'Offers' },
    { href: '/our-story', label: 'Our Story' },
    { href: '/contact', label: 'Store & Contact' },
  ];

  return (
    <>
      {/* ── Top Announcement Bar ── */}
      {!isOpen && !storeStatusLoading ? (
        <div className="bg-[#78281F] text-amber-50 border-b border-[#5E1E17] py-2.5 px-4 text-xs font-medium tracking-wide transition-colors shadow-xs">
          <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
              </span>
              <span className="font-bold text-amber-200 uppercase tracking-wider text-[11px] shrink-0">
                Store Orders Paused
              </span>
              <span className="hidden sm:inline text-amber-100/60">•</span>
              <span className="truncate text-amber-100 text-xs">
                {closedMessage}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0 text-[11px] font-semibold">
              <span className="text-amber-200 bg-black/25 px-2.5 py-0.5 rounded-full border border-amber-300/30">
                Reopens at {openTime}
              </span>
              <span className="hidden md:inline text-amber-200/80">
                Catalog &amp; Cart Active
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#F5EBE1] border-b border-[#EADDCF] text-[#653819] py-2 px-4 text-xs font-medium tracking-wide">
          <div className="max-w-[1360px] mx-auto flex items-center justify-center md:justify-between gap-6 flex-wrap">
            <Link href="/delivery-charges" className="hidden md:flex items-center gap-1.5 hover:underline">
              <span>🚚</span>
              <span>Free Delivery on qualifying orders</span>
            </Link>
            <Link href="/faq" className="hidden md:flex items-center gap-1.5 hover:underline">
              <span>⚡</span>
              <span>Quick Dispatch within 24h</span>
            </Link>
            <Link href="/faq" className="hidden md:flex items-center gap-1.5 hover:underline">
              <span>🔒</span>
              <span>100% Secure Payments</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/our-story" className="flex items-center gap-1.5 hover:underline">
                <span>🏠</span>
                <span className="font-semibold">Homemade Quality</span>
              </Link>
              <span className="md:hidden opacity-40">|</span>
              <Link href="/delivery-charges" className="md:hidden flex items-center gap-1 hover:underline">
                <span>🚚</span>
                <span>Fast Delivery</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Header Navbar ── */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-[0_4px_20px_rgba(45,21,8,0.06)] border-b border-[#EFE6DC]'
            : 'bg-white border-b border-[#EFE6DC]'
        }`}
      >
        <div className="max-w-[1360px] mx-auto px-4 md:px-6 lg:px-8 h-[74px] md:h-[84px] flex items-center justify-between gap-4 md:gap-8">

          {/* ── Left: Falguni Logo ── */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-[1.02]">
              <div className="relative h-12 w-28 md:h-14 md:w-36">
                <Image
                  src="/falguni-logo-transparent.png"
                  alt="Falguni Gruh Udhyog"
                  fill
                  priority
                  sizes="(max-width: 768px) 112px, 144px"
                  unoptimized
                  className="object-contain object-left"
                />
              </div>
            </Link>
          </div>

          {/* ── Center: Desktop Navigation Links ── */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => {
              if (link.hasDropdown) {
                return (
                  <div
                    key={link.label}
                    className="relative"
                    onMouseEnter={() => setShopDropdown(true)}
                    onMouseLeave={() => setShopDropdown(false)}
                  >
                    <Link
                      href={link.href}
                      className="flex items-center gap-1 text-[15px] font-semibold text-[#2D1508] hover:text-[#733617] transition-colors py-2"
                    >
                      {link.label}
                      <ChevronDown size={14} className="text-[#65544A] group-hover:text-[#733617]" />
                    </Link>

                    {shopDropdown && (
                      <div className="absolute top-full left-0 w-60 bg-white rounded-2xl shadow-xl border border-[#EFE6DC] py-2.5 z-50 animate-fade-up">
                        <Link href="/products" className="flex items-center justify-between px-4 py-2 text-xs font-bold text-[#2D1508] hover:bg-[#FAF7F2] hover:text-[#733617] rounded-lg mx-1">
                          <span>Browse All Products</span>
                          <ChevronRight size={13} className="text-[#733617]" />
                        </Link>
                        <Link href="/categories" className="flex items-center justify-between px-4 py-2 text-xs font-bold text-[#2D1508] hover:bg-[#FAF7F2] hover:text-[#733617] rounded-lg mx-1">
                          <span>All 20+ Categories</span>
                          <ChevronRight size={13} className="text-[#733617]" />
                        </Link>
                        <div className="h-px bg-[#EFE6DC] my-1.5" />
                        <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-[#733617]/70">
                          Popular Specialties
                        </div>
                        {[
                          { label: 'Khakhra', href: '/categories/KHAKHRA' },
                          { label: 'Namkeen', href: '/categories/NAMKEEN' },
                          { label: 'Bhakhri', href: '/categories/BHAKHRI' },
                          { label: 'Mukhwas', href: '/categories/MUKHWAS' },
                          { label: 'Traditional Sweets', href: '/categories/SWEETS' },
                          { label: 'Combos & Gift Packs', href: '/categories/COMBOS%20%26%20GIFT%20PACKS' },
                          { label: 'Groundnut Oil Snacks', href: '/categories/GROUNDNUT%20OIL%20PRODUCTS' },
                          { label: 'Pickles & Achar', href: '/categories/PICKLES%20%26%20ACHAR' },
                        ].map(cat => (
                          <Link
                            key={cat.label}
                            href={cat.href}
                            className="block px-4 py-1.5 text-xs text-[#65544A] hover:bg-[#FAF7F2] hover:text-[#733617] rounded-lg mx-1 font-medium transition-colors"
                          >
                            {cat.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[15px] font-semibold text-[#2D1508] hover:text-[#733617] transition-colors"
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* ── Right: Search Pill & Action Icons ── */}
          <div className="flex items-center gap-3 md:gap-5">

            {/* Luxury Expanding Search Input Pill */}
            <form onSubmit={handleSearch} className="relative hidden md:flex items-center transition-all duration-300">
              <div className="relative flex items-center w-[190px] xl:w-[240px] focus-within:w-[260px] xl:focus-within:w-[320px] transition-all duration-300">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search delicacies..."
                  className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-full py-2 pl-4 pr-12 text-xs text-[#2D1508] placeholder-[#9E8E84] focus:outline-none focus:border-[#733617] focus:ring-2 focus:ring-[#733617]/10 focus:bg-white transition-all shadow-inner"
                />
                <div className="absolute right-2.5 flex items-center gap-1">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                      className="p-0.5 text-[#9E8E84] hover:text-[#2D1508] transition-colors"
                    >
                      <X size={12} />
                    </button>
                  )}
                  <button
                    type="submit"
                    aria-label="Search"
                    className="p-0.5 text-[#733617] hover:scale-110 transition-transform"
                  >
                    <Search size={14} />
                  </button>
                </div>
              </div>
            </form>

            {/* Mobile Search Icon Button */}
            <Link
              href="/search"
              aria-label="Search"
              className="md:hidden p-2 text-[#2D1508] hover:text-[#733617] transition-colors"
            >
              <Search size={20} />
            </Link>

            {/* Account Icon + Label */}
            {firebaseUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenu(v => !v)}
                  className="flex flex-col items-center justify-center group p-1 text-[#2D1508] hover:text-[#733617] transition-colors"
                >
                  <User size={20} className="stroke-[1.8] group-hover:scale-105 transition-transform" />
                  <span className="text-[10px] font-medium mt-0.5 hidden sm:block">Account</span>
                </button>

                {userMenu && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-white shadow-2xl border border-[#EFE6DC] py-2 z-50 animate-fade-up">
                    <div className="px-4 py-2 border-b border-[#EFE6DC]">
                      <p className="text-xs font-bold text-[#2D1508] truncate">
                        {userDoc?.fullname || firebaseUser.displayName || 'Customer'}
                      </p>
                      <p className="text-[10px] text-[#65544A] truncate">{firebaseUser.email || firebaseUser.phoneNumber}</p>
                    </div>
                    <Link href="/profile" className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#2D1508] hover:bg-[#FAF7F2] hover:text-[#733617]">
                      <User size={14} /> My Profile
                    </Link>
                    <Link href="/orders" className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#2D1508] hover:bg-[#FAF7F2] hover:text-[#733617]">
                      <Package size={14} /> My Orders
                    </Link>
                    <Link href="/notifications" className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#2D1508] hover:bg-[#FAF7F2] hover:text-[#733617]">
                      <Bell size={14} /> Notifications
                    </Link>
                    <Link href="/favorites" className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#2D1508] hover:bg-[#FAF7F2] hover:text-[#733617]">
                      <Heart size={14} /> Wishlist
                    </Link>
                    <div className="h-px bg-[#EFE6DC] my-1" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2.5 w-full px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 text-left"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex flex-col items-center justify-center group p-1 text-[#2D1508] hover:text-[#733617] transition-colors"
              >
                <User size={20} className="stroke-[1.8] group-hover:scale-105 transition-transform" />
                <span className="text-[10px] font-medium mt-0.5 hidden sm:block">Account</span>
              </Link>
            )}

            {/* Notifications Icon (When logged in) */}
            {firebaseUser && (
              <Link
                href="/notifications"
                className="flex flex-col items-center justify-center group p-1 text-[#2D1508] hover:text-[#733617] transition-colors"
                title="Notifications"
              >
                <Bell size={20} className="stroke-[1.8] group-hover:scale-105 transition-transform" />
                <span className="text-[10px] font-medium mt-0.5 hidden sm:block">Alerts</span>
              </Link>
            )}

            {/* Wishlist Icon + Label */}
            <Link
              href="/favorites"
              className="flex flex-col items-center justify-center group p-1 text-[#2D1508] hover:text-[#733617] transition-colors"
            >
              <Heart size={20} className="stroke-[1.8] group-hover:scale-105 transition-transform" />
              <span className="text-[10px] font-medium mt-0.5 hidden sm:block">Wishlist</span>
            </Link>

            {/* Cart Icon + Badge + Label */}
            <Link
              href="/cart"
              className="relative flex flex-col items-center justify-center group p-1 text-[#2D1508] hover:text-[#733617] transition-colors"
            >
              <div className="relative">
                <ShoppingBag size={20} className="stroke-[1.8] group-hover:scale-105 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center bg-[#733617] text-white shadow-sm">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium mt-0.5 hidden sm:block">Cart</span>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="lg:hidden p-2 text-[#2D1508] hover:text-[#733617] transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

          </div>
        </div>
      </header>

      {/* ── Mobile Navigation Drawer ── */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 top-[110px] z-40 bg-[#FAF7F2] flex flex-col animate-fade-in overflow-y-auto pb-12">
          <div className="p-5 flex flex-col gap-3">

            {/* Mobile Search input */}
            <form onSubmit={handleSearch} className="relative mb-3">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sweets, namkeen, khakhra..."
                  className="w-full bg-white border border-[#E5DCD3] rounded-full py-2.5 pl-4 pr-16 text-sm text-[#2D1508] placeholder-[#9E8E84] focus:outline-none focus:border-[#733617] focus:ring-2 focus:ring-[#733617]/10 shadow-sm"
                />
                <div className="absolute right-3 flex items-center gap-1.5">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                      className="p-1 text-[#9E8E84] hover:text-[#2D1508]"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <button
                    type="submit"
                    aria-label="Search"
                    className="p-1 text-[#733617] hover:scale-105 transition-transform"
                  >
                    <Search size={18} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide mt-2.5 px-1 pb-1">
                {['Khakhra', 'Bhakhri', 'Mathiya', 'Namkeen'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setSearchQuery(term);
                      router.push(`/search?q=${encodeURIComponent(term)}`);
                      setMenuOpen(false);
                    }}
                    className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white border border-[#E5DCD3] text-[#65544A] hover:text-[#733617] hover:border-[#733617]"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </form>

            <div className="bg-white rounded-2xl border border-[#EFE6DC] p-3 divide-y divide-[#EFE6DC]">
              <Link 
                href="/products" 
                onClick={() => setMenuOpen(false)}
                className="block py-3 px-3 text-base font-semibold text-[#2D1508] hover:text-[#733617]"
              >
                Shop All Products
              </Link>
              <Link 
                href="/categories" 
                onClick={() => setMenuOpen(false)}
                className="block py-3 px-3 text-base font-semibold text-[#2D1508] hover:text-[#733617]"
              >
                Browse Categories
              </Link>
              <Link 
                href="/products?sort=bestseller" 
                onClick={() => setMenuOpen(false)}
                className="block py-3 px-3 text-base font-semibold text-[#2D1508] hover:text-[#733617]"
              >
                Bestsellers
              </Link>
              <Link 
                href="/categories/COMBOS%20%26%20GIFT%20PACKS" 
                onClick={() => setMenuOpen(false)}
                className="block py-3 px-3 text-base font-semibold text-[#2D1508] hover:text-[#733617]"
              >
                Combos & Gift Packs
              </Link>
              <Link 
                href="/coupon" 
                onClick={() => setMenuOpen(false)}
                className="block py-3 px-3 text-base font-semibold text-[#733617] hover:text-[#5c2b12]"
              >
                Exclusive Offers & Coupons
              </Link>
              <Link 
                href="/referral-page" 
                onClick={() => setMenuOpen(false)}
                className="block py-3 px-3 text-base font-semibold text-[#2D1508] hover:text-[#733617]"
              >
                Refer Friends & Earn ₹50
              </Link>
              <Link 
                href="/our-story" 
                onClick={() => setMenuOpen(false)}
                className="block py-3 px-3 text-base font-semibold text-[#2D1508] hover:text-[#733617]"
              >
                Our Story & Heritage
              </Link>
              <Link 
                href="/contact" 
                onClick={() => setMenuOpen(false)}
                className="block py-3 px-3 text-base font-semibold text-[#2D1508] hover:text-[#733617]"
              >
                Store Location & Contact
              </Link>
              <Link 
                href="/faq" 
                onClick={() => setMenuOpen(false)}
                className="block py-3 px-3 text-base font-semibold text-[#2D1508] hover:text-[#733617]"
              >
                Help & FAQs
              </Link>
              <Link 
                href="/delivery-charges" 
                onClick={() => setMenuOpen(false)}
                className="block py-3 px-3 text-base font-semibold text-[#2D1508] hover:text-[#733617]"
              >
                Delivery Charges &amp; Zones
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-[#EFE6DC] p-3 divide-y divide-[#EFE6DC]">
              <Link 
                href="/orders" 
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between py-3 px-3 text-sm font-medium text-[#2D1508]"
              >
                <span>My Orders</span>
                <Package size={18} className="text-[#733617]" />
              </Link>
              <Link 
                href="/notifications" 
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between py-3 px-3 text-sm font-medium text-[#2D1508]"
              >
                <span>Notifications</span>
                <Bell size={18} className="text-[#733617]" />
              </Link>
              <Link 
                href="/favorites" 
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between py-3 px-3 text-sm font-medium text-[#2D1508]"
              >
                <span>Wishlist</span>
                <Heart size={18} className="text-[#733617]" />
              </Link>
              <Link 
                href="/profile" 
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between py-3 px-3 text-sm font-medium text-[#2D1508]"
              >
                <span>Account Profile</span>
                <User size={18} className="text-[#733617]" />
              </Link>
            </div>

            <div className="mt-4">
              {firebaseUser ? (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full py-3 text-center text-sm font-bold text-red-600 bg-white rounded-xl border border-red-200 hover:bg-red-50 transition-colors"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full py-3.5 text-center text-sm font-bold text-white bg-[#733617] rounded-xl shadow-md hover:bg-[#5A290F] transition-colors"
                >
                  Sign In / Register
                </Link>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
