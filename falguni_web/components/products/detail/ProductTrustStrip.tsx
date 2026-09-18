'use client';

import { Home, Sparkles, Flame, ShieldCheck } from 'lucide-react';

const TRUST_PILLARS = [
  {
    icon: Home,
    title: 'Homemade Quality',
    desc: 'Crafted with love',
  },
  {
    icon: Sparkles,
    title: 'Quality Ingredients',
    desc: 'Handpicked & pure',
  },
  {
    icon: Flame,
    title: 'Freshly Prepared',
    desc: 'In small batches',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Packaging',
    desc: 'For safe delivery',
  },
];

export default function ProductTrustStrip() {
  return (
    <div className="w-full bg-white border border-[#EFE6DC] rounded-2xl p-4 sm:p-5 mb-8 shadow-2xs">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {TRUST_PILLARS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`flex items-center gap-3 ${
                idx !== 0 ? 'md:border-l md:border-[#EFE6DC] md:pl-5' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#FBF4EE] border border-[#EFE6DC] flex items-center justify-center shrink-0 text-[#733617]">
                <Icon size={20} />
              </div>
              <div className="flex flex-col">
                <h4 className="text-xs sm:text-sm font-bold text-[#2D1508] leading-tight">
                  {item.title}
                </h4>
                <p className="text-[11px] text-[#65544A] mt-0.5 font-normal">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
