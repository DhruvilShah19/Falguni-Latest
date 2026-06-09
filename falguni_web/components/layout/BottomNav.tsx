'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid3X3, ShoppingCart, Heart, User } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/categories', icon: Grid3X3, label: 'Categories' },
  { href: '/cart', icon: ShoppingCart, label: 'Cart', badge: true },
  { href: '/favorites', icon: Heart, label: 'Saved' },
  { href: '/profile', icon: User, label: 'Profile' },
];

// Only shown on mobile (md:hidden). Mirrors Flutter's BottomNavigationBar exactly.
export default function BottomNav() {
  const pathname = usePathname();
  const { totalQuantity } = useCartStore();
  const { firebaseUser } = useAuthStore();
  const cartCount = totalQuantity();

  // Hide bottom nav on auth pages
  if (['/login', '/signup', '/forgot-password'].includes(pathname)) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-bg)] border-t border-[var(--color-border)] pb-safe">
      <div className="flex">
        {navItems.map(({ href, icon: Icon, label, badge }) => {
          const isActive = pathname === href;
          const resolvedHref = !firebaseUser && (href === '/favorites' || href === '/profile')
            ? '/login'
            : href;

          return (
            <Link
              key={href}
              href={resolvedHref}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 relative transition-colors ${
                isActive
                  ? 'text-[var(--color-gold)]'
                  : 'text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]'
              }`}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                {badge && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[var(--color-gold)] text-black text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-[var(--color-gold)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
