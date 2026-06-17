import Link from 'next/link';
import Image from 'next/image';

const SHOP   = [['Categories','/categories'],['All Products','/products'],['Flash Sales','/products?flash=true']];
const ACCOUNT= [['My Profile','/profile'],['My Orders','/orders'],['Favourites','/favorites'],['Cart','/cart']];
const HELP   = [['FAQ','/faq'],['Contact Us','/contact'],['Track Order','/orders']];

export default function Footer() {
  return (
    <footer className="hidden md:block mt-auto" style={{ background: 'var(--color-bg)', borderTop: '1px solid var(--color-border)' }}>

      {/* ── Main footer grid ── */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-8 grid grid-cols-12 gap-8">

        {/* Brand col */}
        <div className="col-span-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center border-2 border-[#D4AF37]/50 shadow-[0_0_20px_rgba(212,175,55,0.15)] flex-shrink-0">
              <Image src="/falguni-logo.png" alt="Falguni" width={48} height={48} className="object-cover w-full h-full scale-[1.15]" />
            </div>
            <div>
              <p className="text-[var(--color-fg)] font-black text-lg leading-none">Falguni</p>
              <p className="text-[var(--color-fg-muted)] text-[10px] tracking-widest uppercase mt-0.5">Gruh Udhyog</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--color-fg-muted)' }}>
            Authentic homemade snacks & sweets, crafted with love and delivered fresh to your door.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-2 mt-5">
            {['🔒 Secure Pay', '🚚 Fast Delivery', '✅ Verified'].map(b => (
              <span key={b}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(212,175,55,0.1)', color: '#B8952A', border: '1px solid rgba(212,175,55,0.2)' }}>
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="col-span-2">
          <FooterCol title="Shop"    links={SHOP} />
        </div>
        <div className="col-span-2">
          <FooterCol title="Account" links={ACCOUNT} />
        </div>
        <div className="col-span-2">
          <FooterCol title="Help"    links={HELP} />
        </div>

        {/* Newsletter */}
        <div className="col-span-2">
          <h4 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--color-fg)' }}>
            Stay Updated
          </h4>
          <p className="text-xs mb-3" style={{ color: 'var(--color-fg-muted)' }}>
            Get deals & new arrivals in your inbox.
          </p>
          <div className="flex flex-col gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full px-3 py-2.5 rounded-xl text-[var(--color-fg)] text-xs outline-none"
              style={{
                background: 'rgba(0,0,0,0.03)',
                border: '1px solid rgba(0,0,0,0.08)',
              }}
            />
            <button
              className="w-full py-2.5 rounded-xl text-xs font-bold btn-gold"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div
        className="border-t max-w-7xl mx-auto px-6 py-4 flex items-center justify-between"
        style={{ borderColor: 'rgba(0,0,0,0.08)' }}
      >
        <p className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>
          © {new Date().getFullYear()} Falguni Gruh Udhyog. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          {['Privacy Policy', 'Terms of Service'].map(t => (
            <Link key={t} href="#"
              className="text-xs transition hover:text-[var(--color-fg)]"
              style={{ color: 'var(--color-fg-muted)' }}>
              {t}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[][] }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--color-fg)' }}>
        {title}
      </h4>
      <ul className="flex flex-col gap-2.5">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href}
              className="text-sm transition-colors hover:text-[var(--color-fg)]"
              style={{ color: 'var(--color-fg-muted)' }}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
