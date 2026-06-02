'use client';
import { useEffect, useState } from 'react';
import ProductCard from '@/components/ui/ProductCard';
import { getProducts } from '@/lib/firestore';
import type { ProductsModel } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

interface Props {
  title?: string;
  limitCount?: number;
  showViewAll?: boolean;
  products?: ProductsModel[]; // optional: pass pre-fetched
}

export default function ProductsGrid({
  title = 'Featured Products',
  limitCount = 12,
  showViewAll = true,
  products: propProducts,
}: Props) {
  const [products, setProducts] = useState<ProductsModel[]>(propProducts ?? []);
  const [loading, setLoading] = useState(!propProducts);

  useEffect(() => {
    if (propProducts) return;
    getProducts(limitCount).then(p => { setProducts(p); setLoading(false); });
  }, [limitCount, propProducts]);

  if (loading) return <LoadingSpinner />;
  if (products.length === 0) return null;

  return (
    <section className="px-4 md:px-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base md:text-lg font-bold text-[var(--color-fg)]">{title}</h2>
        {showViewAll && (
          <Link href="/products" className="text-xs text-[var(--color-gold)] font-semibold hover:underline">
            View all
          </Link>
        )}
      </div>

      {/* Mobile: 2 cols | Tablet: 3 cols | Desktop: 4–5 cols */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {products.map(p => (
          <ProductCard key={p.uid} product={p} />
        ))}
      </div>
    </section>
  );
}
