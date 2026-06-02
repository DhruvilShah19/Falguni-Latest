'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getProductsByCategory } from '@/lib/firestore';
import type { ProductsModel } from '@/types';
import ProductCard from '@/components/ui/ProductCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageShell from '@/components/layout/PageShell';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function CategoryProductsPage() {
  const { slug } = useParams<{ slug: string }>();
  const category = decodeURIComponent(slug);
  const [products, setProducts] = useState<ProductsModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProductsByCategory(category).then(p => { setProducts(p); setLoading(false); });
  }, [category]);

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        {/* Back + title */}
        <div className="flex items-center gap-3 mb-5">
          <Link href="/categories" className="p-1.5 rounded-lg hover:bg-[var(--color-surface)] transition">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-lg md:text-2xl font-bold text-[var(--color-fg)]">{category}</h1>
          {!loading && (
            <span className="text-sm text-[var(--color-fg-muted)]">({products.length} items)</span>
          )}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-[var(--color-fg-muted)]">
            <p className="text-5xl mb-4">🛒</p>
            <p className="font-semibold">No products in this category yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {products.map(p => <ProductCard key={p.uid} product={p} />)}
          </div>
        )}
      </div>
    </PageShell>
  );
}
