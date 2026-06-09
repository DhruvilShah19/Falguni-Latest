import Image from 'next/image';
import Link from 'next/link';
import type { ProductsModel } from '@/types';
import PageShell from '@/components/layout/PageShell';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { getCachedAllProducts, getCachedFlashSales } from '@/lib/cache';
import { Suspense } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const revalidate = 3600;

// Custom Ultra-Premium Boutique Item (No borders, pure editorial)
function BoutiqueItem({ product }: { product: ProductsModel }) {
  const price = product.unitPrice1 ?? 0;

  return (
    <Link href={`/products/${product.uid}`} className="group cursor-pointer flex flex-col mb-8">
      {/* Image container */}
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl shadow-xl mb-5">
        <div className="absolute inset-0 bg-[#D4AF37]/5 z-10 pointer-events-none group-hover:bg-transparent transition-colors duration-700" />
        {product.image1 ? (
          <Image 
            src={product.image1} 
            alt={product.name} 
            fill 
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover scale-100 group-hover:scale-105 transition-transform duration-[1.5s] ease-out saturate-110" 
          />
        ) : (
          <div className="w-full h-full bg-[#2B1B17] flex items-center justify-center opacity-20 text-4xl">✨</div>
        )}
      </div>

      {/* Info container */}
      <div className="flex flex-col items-center text-center px-2">
        <span className="text-[#D4AF37] text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase mb-2">
          {(product.brandName || product.category || 'Collection').toUpperCase()}
        </span>
        
        <h3 className="font-serif text-lg md:text-xl text-white leading-snug mb-3 group-hover:text-[#D4AF37] transition-colors duration-500 line-clamp-2">
          {product.name}
        </h3>
        
        <div className="w-8 h-[1px] bg-white/20 mb-4" />
        
        <div className="flex flex-col items-center gap-2 w-full">
          <span className="text-sm md:text-base font-light tracking-widest text-white/90">
            ₹{price}
          </span>
          <span className="text-[9px] md:text-[10px] font-bold tracking-[0.1em] uppercase text-[#D4AF37] border border-[#D4AF37]/30 rounded-full px-4 py-1.5 mt-1 group-hover:bg-[#D4AF37]/10 transition-colors duration-300">
            View Details
          </span>
        </div>
      </div>
    </Link>
  );
}

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
    <div className="flex flex-col min-h-screen bg-[#2B1B17]">
      
      {/* ── Ultra Premium Editorial Hero ── */}
      <div className="relative w-full min-h-[50vh] flex flex-col items-center justify-center pt-32 pb-16 px-4 border-b border-[#D4AF37]/10">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.05),transparent_60%)] pointer-events-none" />
         


         <div className="relative z-10 text-center flex flex-col items-center max-w-4xl mx-auto animate-fade-up">
           <span className="text-[#D4AF37] font-bold tracking-[0.5em] uppercase text-xs mb-8 flex items-center justify-center gap-6">
             <span className="w-16 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]" />
             {isFlash ? 'EXCLUSIVE' : 'MAISON FALGUNI'}
             <span className="w-16 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]" />
           </span>
           
           <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-8 tracking-tight" style={{ fontStyle: 'italic' }}>
             {isFlash ? 'Flash' : 'Lookbook'}
           </h1>
           
           <p className="text-white/40 max-w-xl text-sm md:text-base leading-[2] font-light tracking-wide">
             Discover our complete collection of premium sweets, savory namkeens, and healthy dry fruits. Perfectly crafted snacks for every craving.
           </p>
         </div>
      </div>

      {/* ── Minimalist Category Filters (URL Driven) ── */}
      {uniqueCategories.length > 0 && (
        <div className="w-full max-w-7xl mx-auto px-6 mb-16 py-8 animate-fade-up border-b border-white/5" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-center gap-6 md:gap-10 flex-wrap">
            <Link
              href={getCategoryLink(null)}
              className={`text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 pb-2 border-b-2 ${
                selectedCategory === null
                  ? 'text-[#D4AF37] border-[#D4AF37]'
                  : 'text-white/30 border-transparent hover:text-white'
              }`}
            >
              All Pieces
            </Link>
            {uniqueCategories.slice(0, 10).map(cat => (
              <Link
                key={cat}
                href={getCategoryLink(cat)}
                className={`text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 pb-2 border-b-2 ${
                  selectedCategory === cat
                    ? 'text-[#D4AF37] border-[#D4AF37]'
                    : 'text-white/30 border-transparent hover:text-white'
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      )}

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
