'use client';
import { useEffect, useState } from 'react';
import { getRecentPurchasedProducts } from '@/lib/firestore';
import type { ProductsModel } from '@/types';
import ProductCard from '@/components/ui/ProductCard';
import SectionHeader from '@/components/ui/SectionHeader';
import { useAuthStore } from '@/store/authStore';

export default function RecentlyPurchasedSection() {
  const { firebaseUser } = useAuthStore();
  const [products, setProducts] = useState<ProductsModel[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!firebaseUser) {
      setProducts([]);
      setLoaded(true);
      return;
    }
    
    getRecentPurchasedProducts(firebaseUser.uid).then(p => { 
      setProducts(p); 
      setLoaded(true); 
    });
  }, [firebaseUser]);

  // Don't render if not logged in or no recent purchases
  if (!loaded || products.length === 0 || !firebaseUser) return null;

  return (
    <section className="mb-12 md:mb-24">
      <SectionHeader
        title="Recent Picks"
        subtitle="Welcome back"
      />

      {/* Clean, Minimalist Horizontal Slider for Recent Picks */}
      <div className="relative w-full">
         {/* Sleek fade gradients on edges for desktop */}
         <div className="hidden md:block absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[var(--color-bg)] to-transparent z-10 pointer-events-none" />
         <div className="hidden md:block absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[var(--color-bg)] to-transparent z-10 pointer-events-none" />
         
         <div className="overflow-x-auto scrollbar-hide px-4 md:px-8 lg:px-12">
           <div className="flex gap-4 md:gap-6 pb-6 pt-2 snap-x snap-mandatory" style={{ width: 'max-content' }}>
             {products.map((p, idx) => (
               <div 
                  key={`${p.uid}-${idx}`} 
                  className="snap-start shrink-0 w-[140px] md:w-[200px] h-full transition-transform duration-500 hover:scale-[1.02]"
                  style={{ 
                    animation: `fadeUp 0.5s ease-out ${idx * 50}ms both`
                  }}
               >
                  <ProductCard product={p} variant="default" />
               </div>
             ))}
           </div>
         </div>
      </div>
    </section>
  );
}
