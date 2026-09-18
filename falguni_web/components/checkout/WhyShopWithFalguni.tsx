'use client';

import { Home, Sparkles, Flame, Shield } from 'lucide-react';

export default function WhyShopWithFalguni() {
  const pillars = [
    {
      icon: Home,
      title: 'Homemade Quality',
      subtitle: 'Crafted with love',
    },
    {
      icon: Sparkles,
      title: 'Handpicked Ingredients',
      subtitle: 'Pure & natural',
    },
    {
      icon: Flame,
      title: 'Freshly Prepared',
      subtitle: 'In small batches',
    },
    {
      icon: Shield,
      title: 'Secure Packaging',
      subtitle: 'For safe delivery',
    },
  ];

  return (
    <div className="w-full bg-[#FAF7F2] border border-[#EFE6DC] rounded-2xl p-4 sm:p-5 mt-6 shadow-xs">
      <h3 className="font-serif text-sm sm:text-base font-bold text-[#2D1508] mb-3 text-left">
        Why shop with Falguni?
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        {pillars.map((p, idx) => {
          const Icon = p.icon;
          return (
            <div
              key={idx}
              className="flex flex-col items-center bg-white/70 border border-[#EFE6DC] rounded-xl p-2.5 sm:p-3"
            >
              <div className="w-7 h-7 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center text-[#733617] mb-1.5">
                <Icon size={14} strokeWidth={1.8} />
              </div>
              <p className="text-[11px] font-bold text-[#2D1508] leading-tight line-clamp-1">
                {p.title}
              </p>
              <p className="text-[9px] text-[#8A796F] mt-0.5 leading-tight line-clamp-1">
                {p.subtitle}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
