import { Suspense } from 'react';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ShopInterface from '@/components/products/ShopInterface';
import { getCachedAllProducts, getCachedFlashSales } from '@/lib/cache';

export const revalidate = 3600;

interface ProductsContentProps {
  searchParams: { [key: string]: string | undefined };
}

async function ProductsContent({ searchParams }: ProductsContentProps) {
  const isFlash = searchParams.flash === 'true';
  const selectedCategory = searchParams.category || null;
  const selectedSort = searchParams.sort || null;

  // Server-side cache fetch (No Firebase reads per user)
  let products = isFlash
    ? await getCachedFlashSales()
    : await getCachedAllProducts();

  // If flash sales requested but collection is empty, fallback to all products
  if (isFlash && products.length === 0) {
    products = await getCachedAllProducts();
  }

  const plainProducts = JSON.parse(JSON.stringify(products));

  return (
    <ShopInterface
      initialProducts={plainProducts}
      initialCategory={selectedCategory}
      initialSort={selectedSort}
      isFlashSale={isFlash}
    />
  );
}

type Next15PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ProductsPage(props: Next15PageProps) {
  const resolvedParams = await props.searchParams;

  // Normalize string[] to string for backwards compatibility
  const normalizedParams: { [key: string]: string | undefined } = {};
  for (const key in resolvedParams) {
    const val = resolvedParams[key];
    normalizedParams[key] = Array.isArray(val) ? val[0] : val;
  }

  return (
    <PageShell>
      <Suspense fallback={<LoadingSpinner />}>
        <ProductsContent searchParams={normalizedParams} />
      </Suspense>
    </PageShell>
  );
}
