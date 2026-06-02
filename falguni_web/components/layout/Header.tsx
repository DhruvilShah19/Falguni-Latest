'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, ShoppingCart, User, Menu, X, Heart, Package } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function Header() {
  const router = useRouter();
  const { totalQuantity } = useCartStore();
  const { firebaseUser } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartCount = totalQuantity();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-brown-dark)] text-white shadow-lg">
      {/* ── Top Bar (desktop only) ── */}
      <div className="hidden md:block bg-[var(--color-primary)] text-xs text-center py-1.5 text-[var(--color-gold-light)]">
        Free delivery on orders above ₹500 &nbsp;·&nbsp; Fresh homemade products
      </div>

      {/* ── Main Header ── */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center gap-2 mr-4">
          <span className="text-[var(--color-gold)] font-black text-xl tracking-tight">
            Falguni
          </span>
          <span className="text-white/70 text-sm font-light hidden sm:inline">Gruh Udhyog</span>
        </Link>

        {/* Search bar — hides on very small screens */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden sm:flex relative">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:border-[var(--color-gold)] transition"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-[var(--color-gold)] transition"
          >
            <Search size={16} />
          </button>
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-1 ml-auto">
          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1 mr-2">
            <NavLink href="/categories">Categories</NavLink>
            <NavLink href="/products">Products</NavLink>
            {firebaseUser && <NavLink href="/orders">Orders</NavLink>}
          </nav>

          {/* Cart */}
          <Link href="/cart" className="relative p-2 hover:text-[var(--color-gold)] transition">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[var(--color-gold)] text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>

          {/* Account */}
          {firebaseUser ? (
            <Link href="/profile" className="p-2 hover:text-[var(--color-gold)] transition">
              <User size={22} />
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-gold)] text-black rounded-lg text-sm font-semibold hover:bg-[var(--color-gold-light)] transition"
            >
              Sign In
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 hover:text-[var(--color-gold)] transition"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Mobile search bar ── */}
      <div className="sm:hidden px-4 pb-3">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:border-[var(--color-gold)] transition"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60">
            <Search size={15} />
          </button>
        </form>
      </div>

      {/* ── Mobile menu drawer ── */}
      {menuOpen && (
        <div className="md:hidden bg-[var(--color-primary)] border-t border-white/10 px-4 py-4 flex flex-col gap-3">
          <MobileNavLink href="/" onClick={() => setMenuOpen(false)}>🏠 Home</MobileNavLink>
          <MobileNavLink href="/categories" onClick={() => setMenuOpen(false)}>📂 Categories</MobileNavLink>
          <MobileNavLink href="/products" onClick={() => setMenuOpen(false)}>🛍 Products</MobileNavLink>
          {firebaseUser ? (
            <>
              <MobileNavLink href="/orders" onClick={() => setMenuOpen(false)}>📦 My Orders</MobileNavLink>
              <MobileNavLink href="/favorites" onClick={() => setMenuOpen(false)}>❤️ Favorites</MobileNavLink>
              <MobileNavLink href="/profile" onClick={() => setMenuOpen(false)}>👤 Profile</MobileNavLink>
              <button
                onClick={handleSignOut}
                className="text-left text-sm text-red-400 font-medium py-1"
              >
                Sign Out
              </button>
            </>
          ) : (
            <MobileNavLink href="/login" onClick={() => setMenuOpen(false)}>Sign In / Register</MobileNavLink>
          )}
        </div>
      )}
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 text-sm font-medium text-white/80 hover:text-[var(--color-gold)] rounded-lg hover:bg-white/5 transition"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="text-sm font-medium text-white/90 hover:text-[var(--color-gold)] py-1 transition"
    >
      {children}
    </Link>
  );
}
