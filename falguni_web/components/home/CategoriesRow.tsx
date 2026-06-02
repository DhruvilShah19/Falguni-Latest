'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getCategories } from '@/lib/firestore';
import type { CategoriesModel } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function CategoriesRow() {
  const [categories, setCategories] = useState<CategoriesModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then(c => { setCategories(c); setLoading(false); });
  }, []);

  if (loading) return <LoadingSpinner size={24} />;
  if (categories.length === 0) return null;

  return (
    <section className="px-4 md:px-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base md:text-lg font-bold text-[var(--color-fg)]">Shop by Category</h2>
        <Link href="/categories" className="text-xs text-[var(--color-gold)] font-semibold hover:underline">
          View all
        </Link>
      </div>

      {/* Mobile: horizontal scroll (mirrors Flutter horizontal ListView) */}
      {/* Desktop: grid */}
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide md:grid md:grid-cols-6 md:overflow-visible lg:grid-cols-8">
        {categories.map((cat) => (
          <Link
            key={cat.uid ?? cat.category}
            href={`/categories/${encodeURIComponent(cat.category)}`}
            className="flex-shrink-0 flex flex-col items-center gap-1.5 group"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] group-hover:border-[var(--color-gold)] transition">
              {cat.image ? (
                <Image
                  src={cat.image}
                  alt={cat.category}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
              )}
            </div>
            <span className="text-[10px] md:text-xs font-medium text-[var(--color-fg)] text-center w-16 md:w-20 line-clamp-2 leading-tight">
              {cat.category}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
