'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import type { ProductsModel } from '@/types';

// Custom Ultra-Premium Boutique Item matching products page
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

export default function SearchInterface({ initialProducts }: { initialProducts: ProductsModel[] }) {
  const [query, setQuery] = useState('');
  const [sortOption, setSortOption] = useState<'relevance' | 'priceLow' | 'priceHigh'>('relevance');
  const [showSort, setShowSort] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const ITEMS_PER_PAGE = 24;

  const curatedSearches = ["Khakhra", "Mathiya", "Traditional", "Snacks"];

  useEffect(() => {
    // Autofocus on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Reset to page 1 when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [query, sortOption]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase().trim();
    let filtered = initialProducts.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) || 
      (p.category && p.category.toLowerCase().includes(lowerQuery)) ||
      (p.description && p.description.toLowerCase().includes(lowerQuery))
    );

    if (sortOption === 'priceLow') {
      filtered.sort((a, b) => (a.unitPrice1 ?? 0) - (b.unitPrice1 ?? 0));
    } else if (sortOption === 'priceHigh') {
      filtered.sort((a, b) => (b.unitPrice1 ?? 0) - (a.unitPrice1 ?? 0));
    }

    return filtered;
  }, [query, initialProducts, sortOption]);

  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);
  const paginatedResults = results.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-[#2B1B17] flex flex-col pb-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.05),transparent_80%)] pointer-events-none" />

      {/* ── Ultra Premium Editorial Hero ── */}
      <div className="relative w-full min-h-[50vh] flex flex-col items-center justify-center pt-32 pb-16 px-4 border-b border-[#D4AF37]/10 mb-8 z-10">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.05),transparent_60%)] pointer-events-none" />

         <div className="relative z-10 text-center flex flex-col items-center max-w-4xl mx-auto animate-fade-up w-full">
           <span className="text-[#D4AF37] font-bold tracking-[0.5em] uppercase text-xs mb-6 flex items-center justify-center gap-6">
             <span className="w-16 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]" />
             YOUR CRAVINGS
             <span className="w-16 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]" />
           </span>
           
           <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-10 tracking-tight" style={{ fontStyle: 'italic' }}>
             Discover
           </h1>

          {/* Luxury Search Input */}
          <div className="relative group w-full animate-fade-up shadow-[0_10px_40px_rgba(212,175,55,0.05)]" style={{ animationDelay: '100ms' }}>
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none z-20">
              <Search size={24} className="text-[#D4AF37]/50 group-focus-within:text-[#D4AF37] transition-colors" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What are you looking for?"
              className="relative z-10 w-full h-16 md:h-20 pl-16 pr-16 bg-[#2B1B17] border border-[#D4AF37]/20 rounded-[2rem] text-xl md:text-3xl font-serif italic text-white placeholder-white/20 focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/[0.04] transition-all"
            />
            {query && (
              <button 
                onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                className="absolute inset-y-0 right-6 flex items-center text-white/20 hover:text-white transition-colors z-20"
              >
                <X size={20} />
              </button>
            )}
          </div>
         </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 md:px-8 relative z-10">
        {/* Sort & Status Bar */}
        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-up border-b border-[#D4AF37]/10 pb-6" style={{ animationDelay: '200ms' }}>
          <div className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase pl-2 md:pl-6 flex items-center gap-4">
            <span className="w-4 h-[1px] bg-[#D4AF37]/50" />
            {query.trim() ? `${results.length} Creations Found` : 'Search entire collection'}
          </div>
          
          {query.trim() && (
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pl-2 pr-4 md:px-0">
              <span className="text-[#D4AF37]/50 text-[10px] font-bold tracking-[0.3em] uppercase flex items-center gap-2 mr-2">
                <SlidersHorizontal size={14} /> Sort
              </span>
              
              <button 
                onClick={() => setSortOption('relevance')}
                className={`whitespace-nowrap text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase pb-1 border-b-2 transition-all ${sortOption === 'relevance' ? 'text-[#D4AF37] border-[#D4AF37]' : 'text-white/30 border-transparent hover:text-white'}`}
              >
                Relevance
              </button>
              
              <button 
                onClick={() => setSortOption('priceLow')}
                className={`whitespace-nowrap text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase pb-1 border-b-2 transition-all ${sortOption === 'priceLow' ? 'text-[#D4AF37] border-[#D4AF37]' : 'text-white/30 border-transparent hover:text-white'}`}
              >
                Price: Asc
              </button>
              
              <button 
                onClick={() => setSortOption('priceHigh')}
                className={`whitespace-nowrap text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase pb-1 border-b-2 transition-all ${sortOption === 'priceHigh' ? 'text-[#D4AF37] border-[#D4AF37]' : 'text-white/30 border-transparent hover:text-white'}`}
              >
                Price: Desc
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 mt-16 relative z-10">
        {!query.trim() ? (
          /* Empty State - Curated Searches */
          <div className="animate-fade-up flex flex-col items-center justify-center pt-12" style={{ animationDelay: '300ms' }}>
            <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.3em] uppercase mb-8 flex items-center justify-center gap-4">
              <span className="w-12 h-[1px] bg-[#D4AF37]/30" /> Curated Searches <span className="w-12 h-[1px] bg-[#D4AF37]/30" />
            </span>
            <div className="flex flex-wrap justify-center gap-4 max-w-2xl">
              {curatedSearches.map(term => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-6 py-3 rounded-full border border-white/10 bg-white/[0.02] text-white/70 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 transition-all text-xs font-bold tracking-widest uppercase"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Results Grid */
          results.length > 0 ? (
            <div className="pb-12">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 animate-fade-in">
                {paginatedResults.map((product, idx) => (
                  <div key={product.uid ?? product.productID} style={{ animationDelay: `${Math.min(idx, 12) * 50}ms` }} className="animate-fade-up">
                    <BoutiqueItem product={product} />
                  </div>
                ))}
              </div>

              {/* ── Editorial Pagination (Client Driven) ── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-12 mt-16 pt-12 border-t border-white/5">
                  <button 
                    onClick={() => {
                      setCurrentPage(p => Math.max(1, p - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-3 text-[10px] font-bold tracking-[0.3em] uppercase transition-colors ${currentPage > 1 ? 'text-white/50 hover:text-[#D4AF37]' : 'text-white/10 cursor-not-allowed'}`}
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>
                  
                  <span className="text-xl font-serif italic text-white/80">
                    {currentPage} <span className="text-white/20 mx-2">/</span> {totalPages}
                  </span>

                  <button 
                    onClick={() => {
                      setCurrentPage(p => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === totalPages}
                    className={`flex items-center gap-3 text-[10px] font-bold tracking-[0.3em] uppercase transition-colors ${currentPage < totalPages ? 'text-white/50 hover:text-[#D4AF37]' : 'text-white/10 cursor-not-allowed'}`}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-24 animate-fade-in">
              <Search size={48} className="text-[#D4AF37]/20 mb-6" />
              <h3 className="font-serif text-3xl text-white italic mb-4">No acquisitions found</h3>
              <p className="text-white/40 text-sm max-w-sm">We couldn't find any creations matching &quot;{query}&quot;. Try exploring our curated suggestions instead.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
