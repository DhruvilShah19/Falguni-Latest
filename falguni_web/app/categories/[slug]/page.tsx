'use client';
import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProductsByCategory, getCategories } from '@/lib/firestore';
import type { ProductsModel } from '@/types';
import ProductCard from '@/components/ui/ProductCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageShell from '@/components/layout/PageShell';
import BackButton from '@/components/ui/BackButton';
import { ChevronLeft, SlidersHorizontal, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CategoryProductsPage() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();
  const category = decodeURIComponent(slug);
  
  const [products, setProducts] = useState<ProductsModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryImage, setCategoryImage] = useState<string | null>(null);
  
  // UI State
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSub, setActiveSub] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const ITEMS_PER_PAGE = 16;

  // Fetch Data
  useEffect(() => {
    getCategories().then(cats => {
      const match = cats.find(c => c.category === category);
      if (match?.image) setCategoryImage(match.image);
    });
    getProductsByCategory(category).then(p => { setProducts(p); setLoading(false); });
  }, [category]);

  // Derived Filters
  const subcategories = useMemo(() => {
    const subs = new Set(products.map(p => p.subCategory).filter(Boolean));
    return ['All', ...Array.from(subs)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let arr = [...products];
    if (activeSub !== 'All') {
      arr = arr.filter(p => p.subCategory === activeSub);
    }
    if (sortBy === 'price-low') {
      arr.sort((a,b) => (a.unitPrice1 || 0) - (b.unitPrice1 || 0));
    } else if (sortBy === 'price-high') {
      arr.sort((a,b) => (b.unitPrice1 || 0) - (a.unitPrice1 || 0));
    } else if (sortBy === 'rating') {
      arr.sort((a,b) => {
        const rA = a.totalNumberOfUserRating ? (a.totalRating/a.totalNumberOfUserRating) : 0;
        const rB = b.totalNumberOfUserRating ? (b.totalRating/b.totalNumberOfUserRating) : 0;
        return rB - rA;
      });
    }
    return arr;
  }, [products, activeSub, sortBy]);

  // Reset pagination on filter change
  useEffect(() => { setCurrentPage(1); }, [activeSub, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <PageShell>
      {/* ── Premium Dynamic Header Banner ── */}
      <div className="relative w-full overflow-hidden bg-[#2B1B17] border-b border-[#D4AF37]/20 py-12 md:py-24 flex flex-col items-center justify-center mb-0">
         
         {/* Dynamic Background Image */}
         {categoryImage && (
           <div className="absolute inset-0 z-0">
             <Image src={categoryImage} alt={category} fill className="object-cover opacity-30 object-center scale-105" priority />
             <div className="absolute inset-0 bg-gradient-to-t from-[#2B1B17] via-[#2B1B17]/80 to-[#2B1B17]/40" />
           </div>
         )}
         
         {/* Top Controls: Back & Breadcrumbs */}
         <div className="absolute top-4 left-4 right-4 md:top-8 md:left-8 md:right-8 z-20 flex items-center justify-between">
           <BackButton />

           <div className="hidden md:flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 bg-black/20 px-4 py-2 rounded-full backdrop-blur-md border border-white/5">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight size={12} className="text-white/30" />
              <Link href="/categories" className="hover:text-white transition-colors">Categories</Link>
              <ChevronRight size={12} className="text-white/30" />
              <span className="text-[#D4AF37]">{category}</span>
           </div>
         </div>

         {/* Ambient Glows */}
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.2),transparent_70%)] pointer-events-none z-10" />
         
         {/* Title Area */}
         <div className="relative z-20 text-center px-4 max-w-3xl mt-2 md:mt-4">
            <div className="animate-fade-up text-[9px] md:text-xs tracking-[0.2em] md:tracking-[0.4em] font-bold text-[#D4AF37] mb-3 md:mb-5 flex items-center justify-center gap-2 md:gap-4">
               <span className="w-8 md:w-12 h-px bg-[#D4AF37]/50" />
               EXPLORE COLLECTION
               <span className="w-8 md:w-12 h-px bg-[#D4AF37]/50" />
            </div>
            <h1 className="animate-fade-up font-serif text-3xl md:text-6xl lg:text-7xl text-white mb-2 md:mb-6 drop-shadow-[0_0_20px_rgba(212,175,55,0.3)]" style={{ animationDelay: '100ms' }}>
              {category}
            </h1>
            {!loading && products.length > 0 && (
              <p className="animate-fade-up text-white/70 font-medium text-xs md:text-sm tracking-[0.1em] md:tracking-[0.15em] uppercase" style={{ animationDelay: '200ms' }}>
                {products.length} {products.length === 1 ? 'Item' : 'Items'} Available
              </p>
            )}
         </div>
      </div>

      {/* ── Sub-category Pills & Filters Bar ── */}
      {!loading && products.length > 0 && (
        <div className="sticky top-[56px] md:top-[80px] z-40 w-full bg-[#2B1B17]/95 backdrop-blur-xl border-b border-white/5 shadow-lg">
          <div className="max-w-[1400px] mx-auto px-4 md:px-5 lg:px-8 py-3 md:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
            
            {/* Left: Scrollable Pills */}
            <div className="flex-1 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              <div className="flex items-center gap-2 w-max pb-1">
                {subcategories.map(sub => (
                  <button
                    key={sub}
                    onClick={() => setActiveSub(sub)}
                    className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-xs font-bold tracking-wider transition-all ${
                      activeSub === sub 
                        ? 'bg-[#D4AF37] text-[#2B1B17] shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5'
                    }`}
                  >
                    {sub.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Sort Controls */}
            <div className="flex items-center gap-2 md:gap-3 shrink-0 ml-auto md:ml-0">
              <div className="flex items-center gap-1.5 md:gap-2 text-white/50">
                <SlidersHorizontal size={12} className="md:w-3.5 md:h-3.5" />
                <span className="text-[10px] md:text-xs font-bold tracking-wider uppercase">Sort:</span>
              </div>
              <div className="relative group">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-[#2B1B17] border border-white/10 text-white text-[10px] md:text-xs font-bold tracking-wider uppercase rounded-lg md:rounded-xl pl-3 pr-8 py-2 md:pl-4 md:pr-10 md:py-2.5 outline-none focus:border-[#D4AF37]/50 cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
                <ChevronDown size={12} className="absolute right-2.5 md:right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none group-hover:text-white transition-colors" />
              </div>
            </div>

          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto px-5 lg:px-8 pt-8 pb-24">
        {loading ? (
          <div className="py-32 flex justify-center"><LoadingSpinner /></div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-32 text-white/50 flex flex-col items-center justify-center animate-fade-up">
            <div className="w-24 h-24 mb-6 rounded-full border border-white/5 bg-[#2B1B17] flex items-center justify-center shadow-inner">
               <span className="text-4xl opacity-50">🔍</span>
            </div>
            <h3 className="text-xl font-serif text-white mb-2">No Matches Found</h3>
            <p className="max-w-sm mb-8 text-sm">Try changing your filters or selecting a different sub-category to see more products.</p>
            <button onClick={() => { setActiveSub('All'); setSortBy('featured'); }} className="px-8 py-3 rounded-xl border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10 text-xs font-bold tracking-widest uppercase transition-all">
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
              {paginatedProducts.map((p, idx) => (
                <div key={p.uid} className="animate-fade-up" style={{ animationDelay: `${(idx % 10) * 30}ms` }}>
                  <ProductCard product={p} variant="default" />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-20 mb-8 animate-fade-up">
                <button
                  onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={currentPage === 1}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-all font-bold text-xs tracking-widest uppercase"
                >
                  PREV
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                          currentPage === page
                            ? 'bg-[#D4AF37] text-[#2B1B17] shadow-lg shadow-[#D4AF37]/20 scale-105'
                            : 'border border-white/10 text-white/70 hover:border-[#D4AF37]/50 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={currentPage === totalPages}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-all font-bold text-xs tracking-widest uppercase"
                >
                  NEXT
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}

// Ensure ChevronDown is imported
function ChevronDown(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}
