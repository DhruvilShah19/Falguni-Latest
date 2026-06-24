import Image from 'next/image';
import Link from 'next/link';
import type { ProductsModel } from '@/types';
import PageShell from '@/components/layout/PageShell';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { getCachedAllProducts, getCachedFlashSales } from '@/lib/cache';
import { Suspense } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import BoutiqueItem from '@/components/ui/BoutiqueItem';

export const revalidate = 3600;


// Server Component
async function ProductsContent({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const isFlash = searchParams.flash === 'true';
  const selectedCategory = searchParams.category || null;
  const currentPage = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const itemsPerPage = 24; // Show more items since they are smaller now

  // Server-side cache fetch (No Firebase reads per user)
  const products = isFlash ? await getCachedFlashSales() : await getCachedAllProducts();

  // Compute unique categories
  const uniqueCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  // Sort alphabetically by default
  let filtered = [...products].sort((a, b) => a.name.localeCompare(b.name));

  // Filter by category
  if (selectedCategory) {
    filtered = filtered.filter(p => p.category === selectedCategory);
  }

  // Paginate (Server side slicing!)
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const start = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filtered.slice(start, start + itemsPerPage);

  // Helper for generating pagination links while preserving other params
  const getPageLink = (page: number) => {
    const params = new URLSearchParams();
    if (isFlash) params.set('flash', 'true');
    if (selectedCategory) params.set('category', selectedCategory);
    params.set('page', page.toString());
    return `/products?${params.toString()}`;
  };

  // Helper for category links
  const getCategoryLink = (cat: string | null) => {
    const params = new URLSearchParams();
    if (isFlash) params.set('flash', 'true');
    if (cat) params.set('category', cat);
    // resetting page to 1 when changing category
    return `/products?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-[#2B1B17] flex flex-col pb-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.05),transparent_80%)] pointer-events-none" />
      
      {/* ── Premium Header Banner ── */}
      <div className="relative w-full overflow-hidden bg-[#2B1B17] border-b border-[#D4AF37]/10 pt-28 pb-12 md:pt-36 md:pb-20 flex flex-col items-center justify-center mb-6 md:mb-12">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.15),transparent_70%)] pointer-events-none" />

         <div className="relative z-10 text-center px-4 w-full">
            <div className="animate-fade-up text-[9px] md:text-xs tracking-[0.25em] md:tracking-[0.3em] font-bold text-[#D4AF37] mb-3 md:mb-4 flex items-center justify-center gap-2 md:gap-3">
               <span className="w-6 md:w-8 h-px bg-[#D4AF37]/50" />
               {isFlash ? 'EXCLUSIVE' : 'MAISON FALGUNI'}
               <span className="w-6 md:w-8 h-px bg-[#D4AF37]/50" />
            </div>
            
            <h1 className="animate-fade-up font-serif text-2xl md:text-5xl lg:text-6xl text-white drop-shadow-[0_0_15px_rgba(212,175,55,0.2)] mb-2 md:mb-4" style={{ animationDelay: '100ms' }}>
              {isFlash ? 'Flash' : 'Lookbook'}
            </h1>
            
            <p className="animate-fade-up text-[var(--color-fg-muted)] max-w-lg mx-auto text-[11px] md:text-base leading-relaxed px-2" style={{ animationDelay: '200ms' }}>
              Discover our complete collection of premium sweets, savory namkeens, and healthy dry fruits. Perfectly crafted snacks for every craving.
            </p>
         </div>
      </div>

      {/* ── Lookbook Grid ── */}
      <div className="max-w-7xl mx-auto w-full px-4 lg:px-8 relative z-30 pb-32">
        {paginatedProducts.length === 0 ? (
          <div className="text-center py-32">
            <h3 className="text-3xl font-serif text-white/20 italic mb-4">The collection is empty</h3>
          </div>
        ) : (
          <>
            {/* Standard Grid instead of Asymmetrical to fit more items clearly */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-8 md:gap-y-12">
              {paginatedProducts.map((p) => (
                <BoutiqueItem key={p.uid} product={p} />
              ))}
            </div>

            {/* ── Editorial Pagination (URL Driven) ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-12 mt-16 pt-12 border-t border-white/5">
                {currentPage > 1 ? (
                  <Link 
                    href={getPageLink(currentPage - 1)}
                    className="flex items-center gap-3 text-[10px] font-bold tracking-[0.3em] uppercase text-white/50 hover:text-[#D4AF37] transition-colors"
                  >
                    <ChevronLeft size={16} /> Prev
                  </Link>
                ) : (
                  <span className="flex items-center gap-3 text-[10px] font-bold tracking-[0.3em] uppercase text-white/10 cursor-not-allowed">
                    <ChevronLeft size={16} /> Prev
                  </span>
                )}
                
                <span className="text-xl font-serif italic text-white/80">
                  {currentPage} <span className="text-white/20 mx-2">/</span> {totalPages}
                </span>

                {currentPage < totalPages ? (
                  <Link 
                    href={getPageLink(currentPage + 1)}
                    className="flex items-center gap-3 text-[10px] font-bold tracking-[0.3em] uppercase text-white/50 hover:text-[#D4AF37] transition-colors"
                  >
                    Next <ChevronRight size={16} />
                  </Link>
                ) : (
                  <span className="flex items-center gap-3 text-[10px] font-bold tracking-[0.3em] uppercase text-white/10 cursor-not-allowed">
                    Next <ChevronRight size={16} />
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

type Next15PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ProductsPage(props: Next15PageProps) {
  const resolvedParams = await props.searchParams;
  
  // Normalize string[] to string for backwards compatibility with ProductsContent
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
