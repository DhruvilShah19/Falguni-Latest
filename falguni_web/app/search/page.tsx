import PageShell from '@/components/layout/PageShell';
import { getCachedAllProducts } from '@/lib/cache';
import SearchInterface from '@/components/search/SearchInterface';

export const revalidate = 3600;

export default async function SearchPage() {
  const products = await getCachedAllProducts();
  
  return (
    <PageShell>
      <SearchInterface initialProducts={products} />
    </PageShell>
  );
}
