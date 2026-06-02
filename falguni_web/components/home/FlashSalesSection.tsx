'use client';
import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { getFlashSaleProducts } from '@/lib/firestore';
import type { ProductsModel } from '@/types';
import ProductCard from '@/components/ui/ProductCard';
import Link from 'next/link';

export default function FlashSalesSection() {
  const [products, setProducts] = useState<ProductsModel[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getFlashSaleProducts().then(p => { setProducts(p); setLoaded(true); });
  }, []);

  if (!loaded || products.length === 0) return null;

  return (
    <section className="px-4 md:px-6">
      {/* Header with gold accent */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-[var(--color-gold)] text-black rounded-lg p-1">
            <Zap size={14} fill="currentColor" />
          </div>
          <h2 className="text-base md:text-lg font-bold text-[var(--color-fg)]">Flash Sales</h2>
        </div>
        <Link href="/products?flash=true" className="text-xs text-[var(--color-gold)] font-semibold hover:underline">
          See all
        </Link>
      </div>

      {/* Mobile: horizontal scroll | Desktop: grid */}
      <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-4 lg:grid-cols-5 md:overflow-visible">
        {products.slice(0, 8).map(p => (
          <div key={p.uid} className="flex-shrink-0 w-40 md:w-auto">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
