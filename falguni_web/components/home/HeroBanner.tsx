'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getBanners } from '@/lib/firestore';
import type { BannerModel } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroBanner() {
  const [banners, setBanners] = useState<BannerModel[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    getBanners().then(setBanners);
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % banners.length), 4000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (banners.length === 0) {
    return (
      <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 gradient-brand flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-[var(--color-gold)] font-black text-2xl md:text-4xl">Fresh & Homemade</p>
          <p className="text-white/70 mt-1 text-sm md:text-base">Delivered to your doorstep</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 overflow-hidden bg-[var(--color-brown-dark)]">
      {banners.map((b, i) => (
        <div
          key={b.uid ?? i}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0'}`}
        >
          <Image
            src={b.image}
            alt={b.title ?? 'Banner'}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ))}

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      {/* Arrows — desktop only */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => setCurrent(c => (c - 1 + banners.length) % banners.length)}
            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full transition"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrent(c => (c + 1) % banners.length)}
            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full transition"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${
                i === current
                  ? 'bg-[var(--color-gold)] w-5 h-2'
                  : 'bg-white/50 w-2 h-2'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
