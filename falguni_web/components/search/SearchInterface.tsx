'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Search, X, SlidersHorizontal, ChevronLeft, ChevronRight, 
  ChevronDown, Sparkles, RefreshCw 
} from 'lucide-react';
import type { ProductsModel } from '@/types';
import ProductCard from '@/components/ui/ProductCard';
import { getProducts } from '@/lib/firestore';

interface SearchInterfaceProps {
  initialProducts?: ProductsModel[];
}

const POPULAR_SEARCHES = [
  'Khakhra',
  'Bhakhri',
  'Groundnut Oil',
  'Flavoured Khakhra',
  'Diet Special',
  'Hand Made',
  'Dosa Khakhra',
  'Mathiya',
  'Chorafali',
  'Sweets',
  'Farsan',
  'Mukhvas',
];

const ITEMS_PER_PAGE = 20;

export default function SearchInterface({ initialProducts = [] }: SearchInterfaceProps) {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q') || '';

  // Products state with fallback fetch if initial is empty
  const [allProducts, setAllProducts] = useState<ProductsModel[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);

  // Search, filter, and pagination states
  const [query, setQuery] = useState(urlQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsAnchorRef = useRef<HTMLDivElement>(null);

  // Client fallback to ensure products are never empty
  useEffect(() => {
    if (allProducts.length === 0) {
      setLoading(true);
      getProducts(1000)
        .then((items) => {
          if (items && items.length > 0) setAllProducts(items);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching fallback products:', err);
          setLoading(false);
        });
    }
  }, [allProducts.length]);

  // Sync state when URL search parameter changes (e.g. from Header search or back/forward)
  useEffect(() => {
    setQuery(urlQuery);
    setSelectedCategory('All');
    setCurrentPage(1);
  }, [urlQuery]);

  // Helper to update URL query string
  const updateUrlQuery = useCallback((newQuery: string) => {
    if (typeof window === 'undefined') return;
    const trimmed = newQuery.trim();
    const url = new URL(window.location.href);
    if (trimmed) {
      url.searchParams.set('q', trimmed);
    } else {
      url.searchParams.delete('q');
    }
    window.history.replaceState(null, '', url.pathname + (url.search ? url.search : ''));
  }, []);

  // Handle direct input typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setCurrentPage(1);
    updateUrlQuery(val);
  };

  // Handle clicking a popular quick search chip
  const handleSelectTerm = (term: string) => {
    setQuery(term);
    setSelectedCategory('All');
    setCurrentPage(1);
    updateUrlQuery(term);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Clear search input
  const handleClear = () => {
    setQuery('');
    setSelectedCategory('All');
    setCurrentPage(1);
    updateUrlQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Compute multi-token search and relevance scoring
  const searchResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    let list = [...allProducts];

    if (trimmed) {
      const tokens = trimmed.split(/\s+/).filter(Boolean);

      const scored = list.map((item) => {
        const name = (item.name || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        const sub = (item.subCategory || '').toLowerCase();
        const brand = (item.brandName || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();

        let score = 0;

        // Exact match in name
        if (name === trimmed) score += 120;
        else if (name.startsWith(trimmed)) score += 70;
        else if (name.includes(trimmed)) score += 45;

        // Subcategory & Category match
        if (sub.includes(trimmed)) score += 35;
        if (cat.includes(trimmed)) score += 30;
        if (brand.includes(trimmed)) score += 20;

        // Token matches
        let tokenMatches = 0;
        for (const token of tokens) {
          let tokenFound = false;
          if (name.includes(token)) {
            score += 18;
            tokenFound = true;
          }
          if (sub.includes(token)) {
            score += 12;
            tokenFound = true;
          }
          if (cat.includes(token)) {
            score += 10;
            tokenFound = true;
          }
          if (brand.includes(token)) {
            score += 8;
            tokenFound = true;
          }
          if (desc.includes(token)) {
            score += 3;
            tokenFound = true;
          }
          if (tokenFound) tokenMatches++;
        }

        // Bonus if all tokens match across the product fields
        if (tokens.length > 1 && tokenMatches >= tokens.length) {
          score += 30;
        }

        return { item, score };
      });

      list = scored
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((entry) => entry.item);
    }

    return list;
  }, [allProducts, query]);

  // Derive dynamic category chips with counts for current search
  const categoryFilters = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of searchResults) {
      if (item && item.category && typeof item.category === 'string' && item.category.trim()) {
        const c = item.category.trim();
        counts[c] = (counts[c] || 0) + 1;
      }
    }

    const categories = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    return [{ name: 'All', count: searchResults.length }, ...categories];
  }, [searchResults]);

  // Apply Category filter and Sorting
  const finalProducts = useMemo(() => {
    let list = [...searchResults];

    if (selectedCategory !== 'All') {
      list = list.filter(
        (p) => (p.category || '').toUpperCase() === selectedCategory.toUpperCase()
      );
    }

    if (sortBy === 'price-low') {
      list.sort((a, b) => (a.unitPrice1 || a.price || 0) - (b.unitPrice1 || b.price || 0));
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => (b.unitPrice1 || b.price || 0) - (a.unitPrice1 || a.price || 0));
    } else if (sortBy === 'name-asc') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'name-desc') {
      list.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (b.totalRating || 0) - (a.totalRating || 0));
    }

    return list;
  }, [searchResults, selectedCategory, sortBy]);

  // Pagination
  const totalPages = Math.ceil(finalProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = finalProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (resultsAnchorRef.current) {
      resultsAnchorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 220, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D1508] pt-3 sm:pt-5 pb-20 sm:pb-28">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── Breadcrumb (Left-aligned, consistent with other pages) ── */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#8A796F] mb-4 sm:mb-6 font-medium">
          <Link href="/" className="hover:text-[#733617] transition-colors">
            Home
          </Link>
          <span className="text-[#B5A599]" aria-hidden="true">&gt;</span>
          <span
            className={`cursor-pointer transition-colors ${!query.trim() ? 'text-[#733617] font-semibold' : 'hover:text-[#733617]'}`}
            onClick={() => handleClear()}
          >
            Search
          </span>
          {query.trim() && (
            <>
              <span className="text-[#B5A599]" aria-hidden="true">&gt;</span>
              <span className="text-[#733617] font-semibold truncate max-w-[200px] sm:max-w-[320px]">
                "{query.trim()}"
              </span>
            </>
          )}
        </nav>

        {/* ── Search Hero Card (Compact & Streamlined) ── */}
        <div className="relative overflow-hidden bg-gradient-to-b from-[#F5EBE1] to-[#FAF7F2] border border-[#EADDCF] rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-sm mb-5 text-center">
          
          <div className="inline-flex items-center gap-2 text-[9px] sm:text-[11px] font-bold tracking-[0.25em] uppercase text-[#733617] mb-1.5">
            <span className="w-5 sm:w-8 h-px bg-[#733617]/40" />
            <span>AUTHENTIC GUJARATI PANTRY</span>
            <span className="w-5 sm:w-8 h-px bg-[#733617]/40" />
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#2D1508] font-medium tracking-tight mb-2">
            {query.trim() ? `Search Results for "${query.trim()}"` : 'Find Your Favorite Delicacies'}
          </h1>

          <p className="text-xs sm:text-sm text-[#65544A] max-w-xl mx-auto mb-4 sm:mb-5 leading-relaxed">
            Handcrafted Khakhra, fresh Namkeen, traditional sweets, and artisanal groundnut oil products.
          </p>

          {/* Search Input Box */}
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-4 sm:left-5 flex items-center pointer-events-none z-10">
              <Search size={18} className="text-[#733617]" />
            </div>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Search by product, category, brand, or flavor..."
              className="w-full h-12 sm:h-14 pl-11 sm:pl-13 pr-11 sm:pr-13 bg-white border-2 border-[#E5DCD3] rounded-full text-sm sm:text-base text-[#2D1508] placeholder-[#9E8E84] focus:outline-none focus:border-[#733617] focus:ring-4 focus:ring-[#733617]/10 transition-all shadow-md"
            />

            {query.trim() && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search"
                className="absolute inset-y-0 right-3 sm:right-4 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 my-auto rounded-full text-[#65544A] hover:text-[#733617] hover:bg-[#F5EBE1] transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Popular Search Quick Chips */}
          <div className="mt-4 sm:mt-5 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-3xl mx-auto">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#65544A] mr-1 flex items-center gap-1">
              <Sparkles size={12} className="text-[#733617]" /> Popular:
            </span>
            {POPULAR_SEARCHES.map((term) => {
              const isActive = query.toLowerCase() === term.toLowerCase();
              return (
                <button
                  key={term}
                  type="button"
                  onClick={() => handleSelectTerm(term)}
                  className={`px-3 py-1 sm:px-3.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-[#733617] text-white shadow-sm'
                      : 'bg-white border border-[#E5DCD3] text-[#2D1508] hover:border-[#733617] hover:text-[#733617] hover:bg-[#FAF7F2]'
                  }`}
                >
                  {term}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Scroll Anchor for Pagination ── */}
        <div ref={resultsAnchorRef} />

        {/* ── Filter & Sort Bar (Always Visible Above Results) ── */}
        <div className="sticky top-[74px] md:top-[84px] z-30 bg-white/95 backdrop-blur-md border border-[#EFE6DC] rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 shadow-sm mb-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Categories Pill Scroller */}
          <div className="flex-1 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-1.5 sm:gap-2 w-max pb-0.5">
              {categoryFilters.map((cat) => {
                const isSelected = selectedCategory.toUpperCase() === cat.name.toUpperCase();
                return (
                  <button
                    key={cat.name}
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      setCurrentPage(1);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-[#733617] text-white shadow-sm'
                        : 'bg-[#FAF7F2] text-[#65544A] hover:bg-[#EFE6DC] hover:text-[#2D1508] border border-[#EFE6DC]'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-[#2D1508]/10 text-[#733617]'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#EFE6DC]">
            <div className="flex items-center gap-1.5 text-[#65544A]">
              <SlidersHorizontal size={13} className="text-[#733617]" />
              <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase">Sort:</span>
            </div>
            
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-[#FAF7F2] border border-[#EFE6DC] text-[#2D1508] text-[10px] sm:text-xs font-bold tracking-wider uppercase rounded-lg pl-3 pr-8 py-1.5 outline-none focus:border-[#733617] cursor-pointer hover:bg-[#EFE6DC]/50 transition-colors"
              >
                <option value="relevance">Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
                <option value="rating">Top Rated</option>
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#65544A]"
              />
            </div>
          </div>
        </div>

        {/* ── Results Count & Reset Controls ── */}
        <div className="flex items-center justify-between gap-4 mb-4 px-1">
          <div className="text-xs sm:text-sm text-[#65544A]">
            {loading ? (
              <span>Loading authentic delicacies...</span>
            ) : query.trim() ? (
              <span>
                Found <strong className="text-[#2D1508] font-bold">{finalProducts.length}</strong> {finalProducts.length === 1 ? 'delicacy' : 'delicacies'} matching "<span className="text-[#733617] font-semibold">{query.trim()}</span>"
                {selectedCategory !== 'All' && <span> in <strong className="text-[#2D1508]">{selectedCategory}</strong></span>}
              </span>
            ) : (
              <span>
                Showing <strong className="text-[#2D1508] font-bold">{finalProducts.length}</strong> authentic Gujarati creations
                {selectedCategory !== 'All' && <span> in <strong className="text-[#2D1508]">{selectedCategory}</strong></span>}
              </span>
            )}
          </div>

          {(query.trim() || selectedCategory !== 'All' || sortBy !== 'relevance') && (
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold tracking-wider uppercase text-[#733617] hover:underline"
            >
              <RefreshCw size={11} /> Reset Filters
            </button>
          )}
        </div>

        {/* ── Products Grid or Empty State ── */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full border-3 border-[#733617] border-t-transparent animate-spin" />
            <p className="text-xs uppercase tracking-widest text-[#65544A]">Searching delicacies...</p>
          </div>
        ) : paginatedProducts.length > 0 ? (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 animate-fade-in">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.uid || product.productID}
                  product={product}
                  variant="default"
                />
              ))}
            </div>

            {/* ── Luxury Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-6 sm:gap-10 mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-[#EFE6DC]">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase transition-all ${
                    currentPage > 1
                      ? 'bg-white border-[#E5DCD3] text-[#2D1508] hover:bg-[#FAF7F2] hover:border-[#733617] hover:text-[#733617] shadow-sm'
                      : 'bg-transparent border-[#EFE6DC] text-[#65544A]/40 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft size={14} /> Prev
                </button>

                <div className="flex items-center gap-2 text-xs sm:text-sm font-serif font-bold text-[#2D1508]">
                  <span>Page</span>
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#733617] text-white flex items-center justify-center text-xs font-sans font-bold shadow-sm">
                    {currentPage}
                  </span>
                  <span className="text-[#65544A] font-sans">of {totalPages}</span>
                </div>

                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase transition-all ${
                    currentPage < totalPages
                      ? 'bg-white border-[#E5DCD3] text-[#2D1508] hover:bg-[#FAF7F2] hover:border-[#733617] hover:text-[#733617] shadow-sm'
                      : 'bg-transparent border-[#EFE6DC] text-[#65544A]/40 cursor-not-allowed'
                  }`}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ── Empty State ── */
          <div className="bg-white border border-[#EFE6DC] rounded-2xl sm:rounded-3xl p-8 sm:p-14 text-center max-w-xl mx-auto shadow-sm my-8">
            <div className="w-16 h-16 rounded-full bg-[#F5EBE1] flex items-center justify-center mx-auto mb-4 text-[#733617]">
              <Search size={32} />
            </div>

            <h3 className="font-serif text-xl sm:text-2xl text-[#2D1508] font-semibold mb-2">
              No Delicacies Found
            </h3>

            <p className="text-xs sm:text-sm text-[#65544A] mb-6 leading-relaxed">
              We couldn't find any products matching "<strong className="text-[#2D1508]">{query}</strong>"
              {selectedCategory !== 'All' && <span> in category "{selectedCategory}"</span>}.
              Please check your spelling or explore our popular categories below.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleClear}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#733617] text-white text-xs font-bold tracking-wider uppercase hover:bg-[#5A290F] transition-colors shadow-sm"
              >
                Clear Search
              </button>

              <Link
                href="/categories"
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#F5EBE1] border border-[#EADDCF] text-[#2D1508] text-xs font-bold tracking-wider uppercase hover:bg-[#EFE6DC] transition-colors"
              >
                Browse All Categories
              </Link>

              <Link
                href="/products"
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-white border border-[#E5DCD3] text-[#2D1508] text-xs font-bold tracking-wider uppercase hover:bg-[#FAF7F2] transition-colors"
              >
                Shop All
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}


