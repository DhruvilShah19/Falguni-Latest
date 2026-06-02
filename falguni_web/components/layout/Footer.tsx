import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="hidden md:block bg-[var(--color-brown-dark)] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="col-span-1 md:col-span-2">
          <h2 className="text-[var(--color-gold)] font-black text-2xl mb-2">Falguni Gruh Udhyog</h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs">
            Fresh, homemade products made with love and delivered to your doorstep.
          </p>
        </div>

        {/* Shop */}
        <div>
          <h3 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-3">Shop</h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link href="/categories" className="hover:text-[var(--color-gold)] transition">Categories</Link></li>
            <li><Link href="/products" className="hover:text-[var(--color-gold)] transition">All Products</Link></li>
            <li><Link href="/products?flash=true" className="hover:text-[var(--color-gold)] transition">Flash Sales</Link></li>
          </ul>
        </div>

        {/* Account */}
        <div>
          <h3 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-3">Account</h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link href="/profile" className="hover:text-[var(--color-gold)] transition">My Profile</Link></li>
            <li><Link href="/orders" className="hover:text-[var(--color-gold)] transition">My Orders</Link></li>
            <li><Link href="/favorites" className="hover:text-[var(--color-gold)] transition">Favorites</Link></li>
            <li><Link href="/cart" className="hover:text-[var(--color-gold)] transition">Cart</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 text-center py-4 text-xs text-white/30">
        © {new Date().getFullYear()} Falguni Gruh Udhyog. All rights reserved.
      </div>
    </footer>
  );
}
