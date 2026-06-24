'use client';
import { useEffect, useState } from 'react';
import BoutiqueItem from '@/components/ui/BoutiqueItem';
import SectionHeader from '@/components/ui/SectionHeader';
import { getProducts } from '@/lib/firestore';
import type { ProductsModel } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Props {
  title?: string;
  subtitle?: string;
  viewAllHref?: string;
  limitCount?: number;
  products?: ProductsModel[];
  sliceStart?: number;
  sliceEnd?: number;
}

export default function ProductsGrid({
  title = 'Curated For You',
  subtitle = 'Handpicked',
  viewAllHref = '/products',
  limitCount = 20,
  products: propProducts,
  sliceStart = 0,
  sliceEnd = 12,
}: Props) {
  const [products, setProducts] = useState<ProductsModel[]>(propProducts ?? []);
  const [loading, setLoading] = useState(!propProducts);

  useEffect(() => {
    if (propProducts) return;
    getProducts(limitCount).then(p => { setProducts(p); setLoading(false); });
  }, [limitCount, propProducts]);

  if (loading) return <LoadingSpinner />;
  if (products.length === 0) return null;

  const displayProducts = products.slice(sliceStart, sliceEnd);

  return (
    <section className="mb-12 md:mb-24">
      <SectionHeader
        title={title}
        subtitle={subtitle}
        viewAllHref={viewAllHref}
      />

      <div className="relative w-full">
         <div className="hidden md:block absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[var(--color-bg)] to-transparent z-10 pointer-events-none" />
         <div className="hidden md:block absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[var(--color-bg)] to-transparent z-10 pointer-events-none" />
         
         <div className="overflow-x-auto scrollbar-hide px-4 md:px-8 lg:px-12">
           <div className="flex gap-4 md:gap-6 pb-6 pt-2 snap-x snap-mandatory" style={{ width: 'max-content' }}>
             {displayProducts.map((p, idx) => (
               <div 
                  key={p.uid} 
                  className="snap-start shrink-0 w-[160px] md:w-[220px]"
                  style={{ animation: `fadeUp 0.5s ease-out ${idx * 50}ms both` }}
               >
                  <BoutiqueItem product={p} />
               </div>
             ))}
           </div>
         </div>
      </div>
    </section>
  );
}
