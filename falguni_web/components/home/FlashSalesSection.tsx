'use client';
import { useEffect, useState } from 'react';
import { getFlashSaleProducts } from '@/lib/firestore';
import type { ProductsModel } from '@/types';
import ProductCard from '@/components/ui/ProductCard';
import SectionHeader from '@/components/ui/SectionHeader';

export default function FlashSalesSection() {
  const [products, setProducts] = useState<ProductsModel[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getFlashSaleProducts().then(p => { setProducts(p); setLoaded(true); });
  }, []);

  // Don't render at all if no flash sales — matches Flutter: if (flashSales) ...
  if (!loaded || products.length === 0) return null;

  return (
    <section>
      {/* Header — Flutter: _buildSectionHeader("Flash Sales", "Limited time") */}
      <SectionHeader
        title="Flash Sales"
        subtitle="Limited time"
        viewAllHref="/products?flash=true"
      />

      {/* Mobile: horizontal scroll strip — same height/feel as Flutter FlashSalesSlidesHome */}
      <div
        className="flex gap-3 overflow-x-auto pb-2 md:hidden scrollbar-hide px-4 md:px-8 lg:px-12"
      >
        {products.slice(0, 10).map(p => (
          <div key={p.uid} className="flex-shrink-0 w-[140px] md:w-40">
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      {/* Desktop: 5-column grid with 3D card-hover effect */}
      <div
        className="hidden md:grid grid-cols-4 lg:grid-cols-5 gap-4 px-4 md:px-8 lg:px-12"
      >
        {products.slice(0, 10).map(p => (
          <ProductCard key={p.uid} product={p} />
        ))}
      </div>
    </section>
  );
}
