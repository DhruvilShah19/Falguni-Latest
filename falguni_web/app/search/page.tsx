import { Suspense } from 'react';
import PageShell from '@/components/layout/PageShell';
import { getCachedAllProducts } from '@/lib/cache';
import SearchInterface from '@/components/search/SearchInterface';

export const revalidate = 3600;

export default async function SearchPage() {
  const products = await getCachedAllProducts();
  const plainProducts = JSON.parse(JSON.stringify(products));
  
  return (
    <PageShell>
      <Suspense fallback={
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#733617] border-t-transparent animate-spin" />
        </div>
      }>
        <SearchInterface initialProducts={plainProducts} />
      </Suspense>
    </PageShell>
  );
}
