'use client';
const FEATURES = [
  { icon: '🚚', title: 'Free Delivery',    desc: 'On orders above ₹500' },
  { icon: '🏡', title: 'Homemade Quality', desc: 'Crafted fresh daily'  },
  { icon: '⚡', title: 'Quick Dispatch',   desc: 'Same-day delivery'    },
  { icon: '🔒', title: 'Secure Payments',  desc: 'UPI, cards & COD'     },
];

export default function FeatureStrip() {
  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4 gap-px mx-4 md:mx-8 lg:mx-12 mb-10 md:mb-14 mt-6 md:mt-8 rounded-xl md:rounded-2xl overflow-hidden"
      style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.12)' }}
    >
      {FEATURES.map(({ icon, title, desc }) => (
        <div
          key={title}
          className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-2 md:gap-3 px-3 py-4 md:px-5 md:py-4 transition-colors"
          style={{ background: 'var(--color-surface)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(212,175,55,0.08)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--color-surface)'; }}
        >
          <span className="text-xl md:text-2xl animate-float flex-shrink-0">{icon}</span>
          <div>
            <p className="text-[11px] md:text-sm font-bold leading-tight" style={{ color: 'var(--color-fg)' }}>{title}</p>
            <p className="text-[9px] md:text-xs mt-0.5" style={{ color: 'var(--color-fg-muted)' }}>{desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
