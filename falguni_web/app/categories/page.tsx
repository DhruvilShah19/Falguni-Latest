'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getCategories } from '@/lib/firestore';
import type { CategoriesModel } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageShell from '@/components/layout/PageShell';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoriesModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then(c => { setCategories(c); setLoading(false); });
  }, []);

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <h1 className="text-xl md:text-2xl font-bold mb-5 text-[var(--color-fg)]">All Categories</h1>

        {loading ? (
          <LoadingSpinner />
        ) : (
          /* Mobile: 3 cols | Desktop: 5–6 cols */
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {categories.map(cat => (
              <Link
                key={cat.uid ?? cat.category}
                href={`/categories/${encodeURIComponent(cat.category)}`}
                className="group flex flex-col items-center gap-2"
              >
                <div className="w-full aspect-square rounded-2xl overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] group-hover:border-[var(--color-gold)] group-hover:shadow-md transition-all">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.category}
                      width={160}
                      height={160}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                  )}
                </div>
                <span className="text-xs md:text-sm font-medium text-[var(--color-fg)] text-center line-clamp-2 leading-tight">
                  {cat.category}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
