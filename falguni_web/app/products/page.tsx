'use client';
import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProducts, getFlashSaleProducts } from '@/lib/firestore';
import type { ProductsModel } from '@/types';
import ProductCard from '@/components/ui/ProductCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageShell from '@/components/layout/PageShell';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Suspense } from 'react';

function ProductsContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') ?? '';
  const isFlash = searchParams.get('flash') === 'true';

  const [products, setProducts] = useState<ProductsModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchQuery);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'rating'>('default');

  useEffect(() => {
    const fn = isFlash ? getFlashSaleProducts : () => getProducts(100);
    fn().then(p => { setProducts(p); setLoading(false); });
  }, [isFlash]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brandName.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'price-asc') list.sort((a, b) => a.unitPrice1 - b.unitPrice1);
    if (sortBy === 'price-desc') list.sort((a, b) => b.unitPrice1 - a.unitPrice1);
    if (sortBy === 'rating') {
      list.sort((a, b) => {
        const ra = a.totalNumberOfUserRating > 0 ? a.totalRating / a.totalNumberOfUserRating : 0;
        const rb = b.totalNumberOfUserRating > 0 ? b.totalRating / b.totalNumberOfUserRating : 0;
        return rb - ra;
      });
    }
    return list;
  }, [products, search, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg md:text-2xl font-bold text-[var(--color-fg)]">
          {isFlash ? '⚡ Flash Sales' : 'All Products'}
        </h1>
        <span className="text-sm text-[var(--color-fg-muted)]">{filtered.length} items</span>
      </div>

      {/* Search + Sort bar */}
      <div className="flex gap-2 mb-5">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-muted)]" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-gold)] text-[var(--color-fg)] placeholder-[var(--color-fg-muted)] transition"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3">
          <SlidersHorizontal size={14} className="text-[var(--color-fg-muted)]" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="text-sm bg-transparent text-[var(--color-fg)] focus:outline-none cursor-pointer"
          >
            <option value="default">Sort</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-[var(--color-fg-muted)]">
          <p className="text-5xl mb-4">🔍</p>
          <p className="font-semibold">No products found</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {filtered.map(p => <ProductCard key={p.uid} product={p} />)}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <PageShell>
      <Suspense fallback={<LoadingSpinner />}>
        <ProductsContent />
      </Suspense>
    </PageShell>
  );
}
