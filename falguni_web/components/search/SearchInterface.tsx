'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import type { ProductsModel } from '@/types';
import BoutiqueItem from '@/components/ui/BoutiqueItem';

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

      {/* ── Premium Header Banner ── */}
      <div className={`relative w-full overflow-hidden bg-[#2B1B17] border-b border-[#D4AF37]/10 flex flex-col items-center justify-center mb-6 md:mb-12 z-10 pt-28 pb-12 md:pt-36 md:pb-20 transition-all duration-500`}>
         
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.15),transparent_70%)] pointer-events-none" />

         <div className="relative z-10 text-center flex flex-col items-center max-w-4xl mx-auto w-full px-4">
           
           {/* Hide title on mobile when searching to save space */}
           <div className={`transition-all duration-500 overflow-hidden flex flex-col items-center ${query.trim() ? 'h-0 opacity-0 md:h-auto md:opacity-100 md:mb-6' : 'h-[60px] md:h-auto opacity-100 mb-4 md:mb-8'}`}>
             <div className="animate-fade-up text-[9px] md:text-xs tracking-[0.25em] md:tracking-[0.3em] font-bold text-[#D4AF37] mb-3 md:mb-4 flex items-center justify-center gap-2 md:gap-3">
               <span className="w-6 md:w-8 h-px bg-[#D4AF37]/50" />
               YOUR CRAVINGS
               <span className="w-6 md:w-8 h-px bg-[#D4AF37]/50" />
             </div>
             
             <h1 className="animate-fade-up font-serif text-2xl md:text-5xl lg:text-6xl text-white drop-shadow-[0_0_15px_rgba(212,175,55,0.2)]" style={{ animationDelay: '100ms' }}>
               Discover
             </h1>
           </div>

          {/* Luxury Search Input */}
          <div className="relative group w-full animate-fade-up shadow-[0_10px_40px_rgba(212,175,55,0.05)]" style={{ animationDelay: '100ms' }}>
            <div className="absolute inset-y-0 left-5 md:left-6 flex items-center pointer-events-none z-20">
              <Search size={20} className="text-[#D4AF37]/50 group-focus-within:text-[#D4AF37] transition-colors md:w-6 md:h-6" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What are you looking for?"
              className="relative z-10 w-full h-14 md:h-20 pl-14 md:pl-16 pr-14 md:pr-16 bg-[#2B1B17] border border-[#D4AF37]/20 rounded-[2rem] text-lg md:text-3xl font-serif italic text-white placeholder-white/20 focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/[0.04] transition-all"
            />
            {query && (
              <button 
                onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                className="absolute inset-y-0 right-5 md:right-6 flex items-center text-white/20 hover:text-white transition-colors z-20"
              >
                <X size={18} className="md:w-5 md:h-5" />
              </button>
            )}
          </div>
         </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 md:px-8 relative z-10">
        {/* Sort & Status Bar */}
        <div className="mt-4 md:mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 animate-fade-up border-b border-[#D4AF37]/10 pb-4 md:pb-6" style={{ animationDelay: '200ms' }}>
          <div className="text-white/40 text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase pl-1 md:pl-6 flex items-center gap-3 md:gap-4">
            <span className="w-3 md:w-4 h-[1px] bg-[#D4AF37]/50" />
            {query.trim() ? `${results.length} Creations Found` : 'Search entire collection'}
          </div>
          
          {query.trim() && (
            <div className="flex items-center gap-3 md:gap-6 flex-wrap pb-2 md:pb-0 pl-1 md:pl-0 pr-4 w-full md:w-auto mt-4 md:mt-0">
              <span className="text-[#D4AF37]/50 text-[9px] md:text-[10px] font-bold tracking-[0.3em] uppercase flex items-center gap-1.5 md:gap-2 mr-1 md:mr-2 w-full md:w-auto mb-2 md:mb-0">
                <SlidersHorizontal size={12} className="md:w-3.5 md:h-3.5" /> Sort By
              </span>
              
              <button 
                onClick={() => setSortOption('relevance')}
                className={`text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase pb-1 border-b-2 transition-all ${sortOption === 'relevance' ? 'text-[#D4AF37] border-[#D4AF37]' : 'text-white/30 border-transparent hover:text-white'}`}
              >
                Relevance
              </button>
              
              <button 
                onClick={() => setSortOption('priceLow')}
                className={`text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase pb-1 border-b-2 transition-all ${sortOption === 'priceLow' ? 'text-[#D4AF37] border-[#D4AF37]' : 'text-white/30 border-transparent hover:text-white'}`}
              >
                Price: Asc
              </button>
              
              <button 
                onClick={() => setSortOption('priceHigh')}
                className={`text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase pb-1 border-b-2 transition-all ${sortOption === 'priceHigh' ? 'text-[#D4AF37] border-[#D4AF37]' : 'text-white/30 border-transparent hover:text-white'}`}
              >
                Price: Desc
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 mt-8 md:mt-16 relative z-10">
        {!query.trim() ? (
          /* Empty State - Curated Searches */
          <div className="animate-fade-up flex flex-col items-center justify-center pt-8 md:pt-12" style={{ animationDelay: '300ms' }}>
            <span className="text-[#D4AF37] text-[9px] md:text-[10px] font-bold tracking-[0.3em] uppercase mb-6 md:mb-8 flex items-center justify-center gap-3 md:gap-4">
              <span className="w-8 md:w-12 h-[1px] bg-[#D4AF37]/30" /> Curated Searches <span className="w-8 md:w-12 h-[1px] bg-[#D4AF37]/30" />
            </span>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-2xl">
              {curatedSearches.map(term => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-5 md:px-6 py-2.5 md:py-3 rounded-full border border-white/10 bg-white/[0.02] text-white/70 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 transition-all text-[10px] md:text-xs font-bold tracking-widest uppercase"
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
