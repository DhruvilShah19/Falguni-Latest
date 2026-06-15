'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getCategories } from '@/lib/firestore';
import type { CategoriesModel } from '@/types';
import SectionHeader from '@/components/ui/SectionHeader';

export default function CategoriesRow() {
  const [cats, setCats] = useState<CategoriesModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then(c => { setCats(c); setLoading(false); });
  }, []);

  if (loading) return <Skeleton />;
  if (cats.length === 0) return null;

  return (
    <section className="mb-12 md:mb-24">
      <SectionHeader title="Categories" subtitle="Explore by" viewAllHref="/categories" />

      {/* ══════════════════════════════
          MOBILE — minimalist sleek cards
      ══════════════════════════════ */}
      <div className="md:hidden overflow-x-auto scrollbar-hide px-4 md:px-8 lg:px-12">
        <div className="flex gap-4 pb-4" style={{ width: 'max-content' }}>
          {cats.map((cat) => (
            <Link
              key={cat.uid ?? cat.category}
              href={`/categories/${encodeURIComponent(cat.category)}`}
              className="group flex flex-col items-center gap-2"
              style={{ width: 76 }}
            >
              <div 
                className="relative overflow-hidden rounded-full shrink-0"
                style={{
                  width: 76,
                  height: 76,
                  background: 'var(--color-surface)',
                  border: '1px solid rgba(212,175,55,0.2)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                }}
              >
                {cat.image
                  ? <Image src={cat.image} alt={cat.category} fill sizes="110px"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                  : <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No Img</div>
                }
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <div className="flex flex-col items-center px-1 text-center w-full">
                <p className="font-medium text-[var(--color-fg)] transition-colors duration-300 group-hover:text-[#D4AF37] line-clamp-2 leading-tight"
                  style={{ fontSize: 10, letterSpacing: '0.02em', opacity: 0.9 }}>
                  {cat.category}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════
          DESKTOP — elegant minimalistic portrait cards
      ══════════════════════════════ */}
      <div className="hidden md:block overflow-x-auto scrollbar-hide px-4 md:px-8 lg:px-12">
        <div className="flex gap-6 pb-6" style={{ width: 'max-content' }}>
          {cats.map((cat) => (
            <Link
              key={cat.uid ?? cat.category}
              href={`/categories/${encodeURIComponent(cat.category)}`}
              className="group flex flex-col gap-4"
              style={{ width: 180 }}
            >
              <div 
                className="relative overflow-hidden rounded-[24px] w-full"
                style={{
                  height: 250,
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {cat.image
                  ? <Image src={cat.image} alt={cat.category} fill sizes="180px"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                  : <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--color-bg)' }} />
                }
                
                {/* Subtle dimming overlay that clears on hover */}
                <div className="absolute inset-0 bg-black/5 transition-opacity duration-500 group-hover:opacity-0" />
              </div>

              <div className="flex flex-col items-center">
                <p className="font-semibold text-[var(--color-fg)] transition-colors duration-300 group-hover:text-[#D4AF37]"
                  style={{ fontSize: 14, letterSpacing: '0.05em' }}>
                  {cat.category.toUpperCase()}
                </p>
                <div 
                  className="h-px w-4 mt-2 bg-[#D4AF37] opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:w-12" 
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Skeleton() {
  return (
    <section>
      <div className="flex items-end justify-between px-4 md:px-8 lg:px-12 pt-[25px] pb-[15px]">
        <div className="flex flex-col gap-2">
          <div className="h-2.5 w-20 rounded skeleton" />
          <div className="h-5 w-36 rounded skeleton" />
        </div>
        <div className="h-5 w-16 rounded-full skeleton" />
      </div>
      <div className="hidden md:flex gap-6 px-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-4" style={{ width: 180 }}>
            <div className="rounded-[24px] skeleton w-full" style={{ height: 250 }} />
            <div className="h-4 w-24 mx-auto rounded skeleton" />
          </div>
        ))}
      </div>
      <div className="flex gap-4 px-4 md:hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2" style={{ width: 76 }}>
            <div className="rounded-full skeleton shrink-0" style={{ width: 76, height: 76 }} />
            <div className="h-2 w-12 rounded skeleton" />
          </div>
        ))}
      </div>
    </section>
  );
}
