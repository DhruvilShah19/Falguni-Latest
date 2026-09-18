'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getCategories } from '@/lib/firestore';
import type { CategoriesModel } from '@/types';

const DEFAULT_CATEGORIES = [
  { category: 'Khakhra', image: '/4_2.avif' },
  { category: 'Namkeen', image: '/onboarding/snacks.png' },
  { category: 'Farsan',  image: '/4_1.webp' },
  { category: 'Mukhvas', image: '/4_2.avif' },
  { category: 'Sweets',  image: '/onboarding/snacks.png' },
  { category: 'Pickles', image: '/4_1.webp' },
];

export default function CategoriesRow() {
  const [cats, setCats] = useState<CategoriesModel[]>([]);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then(c => {
        if (c && c.length > 0) {
          setCats(c.slice(0, 6));
        } else {
          setCats(DEFAULT_CATEGORIES as CategoriesModel[]);
        }
        setLoading(false);
      })
      .catch(() => {
        setCats(DEFAULT_CATEGORIES as CategoriesModel[]);
        setLoading(false);
      });
  }, []);

  const displayCats: CategoriesModel[] = cats.length >= 6 ? cats.slice(0, 6) : (DEFAULT_CATEGORIES as CategoriesModel[]);

  return (
    <section className="py-8 md:py-14 bg-[#FAF7F2]">
      <div className="max-w-[1360px] mx-auto px-4 md:px-8">

        {/* ── Editorial Header: — ⟡ Something for Every Craving ⟡ — ── */}
        <div className="flex items-center justify-center gap-3 md:gap-4 mb-8 md:mb-10 text-center">
          <span className="h-px w-8 md:w-12 bg-[#D49B4B]/60" />
          <span className="text-[#D49B4B] text-xs md:text-sm">⟡</span>
          <h2 className="font-serif text-2xl md:text-3xl lg:text-[32px] font-bold text-[#2D1508] tracking-tight">
            Something for Every Craving
          </h2>
          <span className="text-[#D49B4B] text-xs md:text-sm">⟡</span>
          <span className="h-px w-8 md:w-12 bg-[#D49B4B]/60" />
        </div>

        {/* ── 6 Category Cards Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4 md:gap-5">
          {displayCats.map((cat, i) => {
            const catName = cat.category;
            const img = cat.image || DEFAULT_CATEGORIES[i % DEFAULT_CATEGORIES.length].image;

            return (
              <Link
                key={cat.uid || catName}
                href={`/categories/${encodeURIComponent(catName.toUpperCase())}`}
                className="group bg-white rounded-2xl border border-[#EFE6DC] p-3 md:p-4 flex flex-col items-center shadow-[0_2px_10px_rgba(45,21,8,0.03)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                {/* Overhead Bowl Container */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-[#FAF7F2]">
                  <Image
                    src={img}
                    alt={catName}
                    fill
                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 15vw"
                    className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                  />
                  {/* Subtle inner plate shadow */}
                  <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-xl pointer-events-none" />
                </div>

                {/* Category Title */}
                <p className="text-xs md:text-sm font-semibold text-[#2D1508] group-hover:text-[#733617] transition-colors text-center capitalize">
                  {catName}
                </p>
              </Link>
            );
          })}
        </div>

        {/* ── View All Categories Link ── */}
        <div className="flex justify-center mt-8 md:mt-10">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#733617] hover:text-[#5A290F] group transition-colors"
          >
            <span>VIEW ALL CATEGORIES</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
