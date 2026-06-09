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
      className="hidden md:grid grid-cols-4 gap-px mx-6 mt-5 rounded-2xl overflow-hidden"
      style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.12)' }}
    >
      {FEATURES.map(({ icon, title, desc }) => (
        <div
          key={title}
          className="flex items-center gap-3 px-5 py-4 transition-colors"
          style={{ background: 'var(--color-surface)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(212,175,55,0.08)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--color-surface)'; }}
        >
          <span className="text-2xl animate-float flex-shrink-0">{icon}</span>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--color-fg)' }}>{title}</p>
            <p className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>{desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
