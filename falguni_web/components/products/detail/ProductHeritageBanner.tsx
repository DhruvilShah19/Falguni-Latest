'use client';

import Image from 'next/image';
import { BookOpen, Sparkles, ChefHat, Heart } from 'lucide-react';

interface ProductHeritageBannerProps {
  productImage?: string;
}

export default function ProductHeritageBanner({ productImage }: ProductHeritageBannerProps) {
  const displayImage = productImage || '/shop-banner-snacks.jpg';

  const PILLARS = [
    {
      icon: BookOpen,
      title: 'Traditional Recipes',
      desc: 'Passed down through generations',
    },
    {
      icon: Sparkles,
      title: 'Finest Ingredients',
      desc: 'Carefully selected for purity',
    },
    {
      icon: ChefHat,
      title: 'Made Fresh Daily',
      desc: 'Prepared in small batches',
    },
    {
      icon: Heart,
      title: 'Made with Love',
      desc: 'From our family to yours',
    },
  ];

  return (
    <div className="w-full bg-[#FAF7F2] border border-[#EFE6DC] rounded-3xl overflow-hidden mb-12 shadow-xs">
      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
        {/* ── Left Column: Atmospheric Dish Photo (5 cols) ── */}
        <div className="lg:col-span-5 relative min-h-[240px] sm:min-h-[280px] lg:min-h-full bg-stone-200">
          <Image
            src={displayImage}
            alt="Made with the Falguni Touch"
            fill
            sizes="(max-width: 1024px) 100vw, 450px"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/20 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* ── Right Column: Story & 4 Heritage Pillars (7 cols) ── */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center text-left">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1508] mb-2 leading-tight">
            Made with the Falguni Touch
          </h3>
          <p className="text-xs sm:text-sm text-[#65544A] leading-relaxed mb-6 font-normal max-w-xl">
            We use handpicked ingredients, age-old family recipes and personal oversight of every batch to bring you the authentic taste and quality you trust.
          </p>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-4 border-t border-[#EFE6DC]">
            {PILLARS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex flex-col items-start text-left">
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#EFE6DC] flex items-center justify-center text-[#733617] mb-2 shadow-2xs">
                    <Icon size={16} />
                  </div>
                  <h4 className="text-xs font-bold text-[#2D1508] leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#8A796F] mt-0.5 leading-tight">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
