'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getSliderFeeds, type SliderFeed } from '@/lib/firestore';

const AUTO_MS = 6000;

const DEFAULT_SLIDES: SliderFeed[] = [
  {
    uid: 'slide-1',
    title: 'Generations of Taste',
    detail: 'Authentic homemade snacks & sweets, crafted with love and delivered fresh to your door.',
    category: 'ALL PRODUCTS',
    subCategory: '',
    image: '/4_1.webp',
    slider: true,
  },
  {
    uid: 'slide-2',
    title: 'Handmade Khakhra & Bhakhri',
    detail: 'Crispy, slow-roasted delicacies prepared with traditional Gujarati family recipes.',
    category: 'KHAKHRA',
    subCategory: '',
    image: '/4_2.avif',
    slider: true,
  },
  {
    uid: 'slide-3',
    title: 'Fresh Namkeen & Farsan',
    detail: 'Golden, crispy, and bursting with aromatic spices. The timeless taste of Gujarat.',
    category: 'NAMKEEN',
    subCategory: '',
    image: '/onboarding/snacks.png',
    slider: true,
  },
];

export default function HeroBanner() {
  const [slides, setSlides] = useState<SliderFeed[]>(DEFAULT_SLIDES);
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    getSliderFeeds()
      .then(s => {
        if (s && s.length > 0) {
          setSlides(s);
        }
      })
      .catch(() => {});
  }, []);

  const goTo = useCallback((next: number) => {
    setIdx(next);
  }, []);

  const advance = useCallback(() => {
    setSlides(curr => {
      if (!curr.length) return curr;
      setIdx(prev => (prev + 1) % curr.length);
      return curr;
    });
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;
    timerRef.current = setInterval(advance, AUTO_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length, advance]);

  const slide = slides[idx] || DEFAULT_SLIDES[0];

  return (
    <div className="w-full bg-[#FAF7F2] py-4 md:py-8 lg:py-10">
      <div className="max-w-[1360px] mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">

          {/* Left Column: Editorial Typography & CTAs (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-start justify-center">
            <h1 className="font-serif text-[#2D1508] text-4xl sm:text-5xl lg:text-[54px] font-bold leading-[1.08] tracking-tight mb-5">
              {slide.title ? (
                slide.title
              ) : (
                <>
                  Generations<br />of Taste
                </>
              )}
            </h1>

            <p className="text-[#65544A] text-base md:text-lg leading-relaxed max-w-md mb-8">
              {slide.detail || 'Authentic homemade snacks & sweets, crafted with love and delivered fresh to your door.'}
            </p>

            <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 mb-10 w-full sm:w-auto">
              <Link
                href={slide.category && slide.category !== 'ALL PRODUCTS' ? `/products?category=${encodeURIComponent(slide.category)}` : '/products'}
                className="w-full sm:w-auto text-center px-7 py-3.5 rounded-lg bg-[#733617] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5A290F] shadow-sm hover:shadow-md transition-all"
              >
                {slide.category && slide.category !== 'ALL PRODUCTS' ? `EXPLORE ${slide.category.toUpperCase()}` : 'SHOP ALL PRODUCTS'}
              </Link>
              <Link
                href="#our-story"
                className="w-full sm:w-auto text-center px-7 py-3.5 rounded-lg border-[1.5px] border-[#733617] text-[#733617] text-xs font-bold uppercase tracking-wider hover:bg-[#F5EBE1] transition-all"
              >
                EXPLORE FALGUNI
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#EFE6DC] w-full text-[#65544A]">
              <div className="flex items-center gap-2">
                <span className="text-base">🏠</span>
                <span className="text-[11px] font-medium leading-tight">Homemade<br />Quality</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">⚡</span>
                <span className="text-[11px] font-medium leading-tight">Quick<br />Dispatch</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">🔒</span>
                <span className="text-[11px] font-medium leading-tight">Secure<br />Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">🚚</span>
                <span className="text-[11px] font-medium leading-tight">Free Delivery<br />on qualifying orders</span>
              </div>
            </div>
          </div>

          {/* Right Column: Overhead Feast Spread Image & Pagination (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-3xl overflow-hidden shadow-md border border-[#EFE6DC] bg-white group">
              <div className="relative w-full h-full">
                <Image
                  src={slide.image || '/4_1.webp'}
                  alt={slide.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2D1508]/30 via-transparent to-transparent pointer-events-none" />

                <div className="absolute bottom-5 left-5 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-md border border-[#EFE6DC]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#733617]">
                    Handcrafted Specialty
                  </p>
                  <p className="text-xs font-semibold text-[#2D1508]">
                    {slide.title}
                  </p>
                </div>
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex items-center gap-2.5 mt-5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === idx ? 'w-6 bg-[#733617]' : 'w-2 bg-[#D4C3B7] hover:bg-[#A07255]'
                  }`}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
