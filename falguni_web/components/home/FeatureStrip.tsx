'use client';
import { ChefHat, Zap, ShieldCheck, Truck } from 'lucide-react';

const FEATURES = [
  {
    icon: ChefHat,
    title: 'Homemade Quality',
    desc: 'Crafted fresh daily with traditional recipes',
  },
  {
    icon: Zap,
    title: 'Quick Dispatch',
    desc: 'Orders dispatched the same day',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payments',
    desc: 'UPI, Cards, Netbanking & COD available',
  },
  {
    icon: Truck,
    title: 'Free Delivery',
    desc: 'On qualifying orders across India',
  },
];

export default function FeatureStrip() {
  return (
    <section className="py-8 md:py-10 bg-[#FAF7F2]">
      <div className="max-w-[1360px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 border border-[#EFE6DC]/80 shadow-2xs hover:bg-white hover:shadow-sm transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-[#733617] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Icon size={22} className="stroke-[1.8]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#2D1508] leading-snug">
                  {title}
                </h4>
                <p className="text-xs text-[#65544A] mt-0.5 leading-snug">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
