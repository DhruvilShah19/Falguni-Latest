'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { SlidersHorizontal, ChevronLeft, ChevronRight, X, ChevronDown, RefreshCw } from 'lucide-react';
import type { ProductsModel } from '@/types';
import ShopHeaderBanner from './ShopHeaderBanner';
import ShopCategoryBar, { TOP_CATEGORIES } from './ShopCategoryBar';
import ShopSidebarFilters, { FilterState } from './ShopSidebarFilters';
import ShopProductCard from './ShopProductCard';
import FeatureStrip from '@/components/home/FeatureStrip';
import { useAuthStore } from '@/store/authStore';
import { subscribeToFavorites } from '@/lib/firestore';

interface ShopInterfaceProps {
  initialProducts: ProductsModel[];
  initialCategory?: string | null;
  initialSort?: string | null;
  isFlashSale?: boolean;
}

const ITEMS_PER_PAGE = 24;

export default function ShopInterface({
  initialProducts,
  initialCategory,
  initialSort,
  isFlashSale,
}: ShopInterfaceProps) {
  const { firebaseUser } = useAuthStore();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // Listen for user favorites if logged in
  useEffect(() => {
    if (!firebaseUser) {
      setFavoriteIds(new Set());
      return;
    }
    const unsubscribe = subscribeToFavorites(firebaseUser.uid, (items) => {
      const ids = new Set(items.map(p => p.productID || p.uid));
      setFavoriteIds(ids);
    });
    return () => unsubscribe();
  }, [firebaseUser]);

  // Handle favorite toggle from child card
  const handleFavoriteToggle = (productId: string, favorited: boolean) => {
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (favorited) {
        next.add(productId);
      } else {
        next.delete(productId);
      }
      return next;
    });
  };

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    category: initialCategory ? initialCategory.toLowerCase() : 'all',
    subCategory: 'all',
    priceRange: 'all',
    customMinPrice: '',
    customMaxPrice: '',
    appliedMinPrice: null,
    appliedMaxPrice: null,
    selectedWeights: [],
    dietaryPreferences: [],
    minRating: null,
  });

  const resolveInitialSort = (sort?: string | null): 'popularity' | 'priceAsc' | 'priceDesc' | 'rating' | 'newest' => {
    if (!sort) return 'popularity';
    const s = sort.toLowerCase();
    if (s === 'bestseller' || s === 'bestsellers' || s === 'popularity') return 'popularity';
    if (s === 'price-low' || s === 'priceasc') return 'priceAsc';
    if (s === 'price-high' || s === 'pricedesc') return 'priceDesc';
    if (s === 'rating') return 'rating';
    if (s === 'new' || s === 'newest') return 'newest';
    return 'popularity';
  };

  // Sort Option State
  const [sortBy, setSortBy] = useState<
    'popularity' | 'priceAsc' | 'priceDesc' | 'rating' | 'newest'
  >(resolveInitialSort(initialSort));

  useEffect(() => {
    if (initialSort) {
      setSortBy(resolveInitialSort(initialSort));
      setCurrentPage(1);
    }
  }, [initialSort]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Mobile Filter Drawer State
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Top Grid Scroll Anchor Ref
  const gridTopRef = useRef<HTMLDivElement>(null);

  // Reset pagination when any filter or sort option changes
  const updateFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearAll = () => {
    setFilters({
      category: 'all',
      subCategory: 'all',
      priceRange: 'all',
      customMinPrice: '',
      customMaxPrice: '',
      appliedMinPrice: null,
      appliedMaxPrice: null,
      selectedWeights: [],
      dietaryPreferences: [],
      minRating: null,
    });
    setSortBy('popularity');
    setCurrentPage(1);
  };

  // Filter and Sort Pipeline
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // 1. Category Filter
    if (filters.category && filters.category !== 'all') {
      const catConfig = TOP_CATEGORIES.find(c => c.id === filters.category);
      const kw = (catConfig?.matchKeyword || filters.category).toLowerCase();

      result = result.filter(p => {
        const cat = (p.category || '').toLowerCase();
        const subCat = (p.subCategory || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        return cat.includes(kw) || subCat.includes(kw) || name.includes(kw);
      });
    }

    // 1B. SubCategory Filter
    if (filters.subCategory && filters.subCategory !== 'all') {
      const subKw = filters.subCategory.toLowerCase();
      result = result.filter(p => (p.subCategory || '').toLowerCase() === subKw);
    }

    // 2. Price Range Filter
    if (filters.priceRange === 'under100') {
      result = result.filter(p => (p.unitPrice1 ?? p.price ?? 0) < 100);
    } else if (filters.priceRange === '100-200') {
      result = result.filter(p => {
        const price = p.unitPrice1 ?? p.price ?? 0;
        return price >= 100 && price <= 200;
      });
    } else if (filters.priceRange === '200-300') {
      result = result.filter(p => {
        const price = p.unitPrice1 ?? p.price ?? 0;
        return price >= 200 && price <= 300;
      });
    } else if (filters.priceRange === 'above300') {
      result = result.filter(p => (p.unitPrice1 ?? p.price ?? 0) > 300);
    } else if (filters.priceRange === 'custom') {
      if (filters.appliedMinPrice !== null) {
        result = result.filter(
          p => (p.unitPrice1 ?? p.price ?? 0) >= (filters.appliedMinPrice as number)
        );
      }
      if (filters.appliedMaxPrice !== null) {
        result = result.filter(
          p => (p.unitPrice1 ?? p.price ?? 0) <= (filters.appliedMaxPrice as number)
        );
      }
    }

    // 3. Weight Filter
    if (filters.selectedWeights.length > 0) {
      result = result.filter(p => {
        const unitStrings = [
          p.unitname1,
          p.unitname2,
          p.unitname3,
          p.unitname4,
          p.unitname5,
          p.unitname6,
          p.unitname7,
        ]
          .filter(Boolean)
          .map(u => u.toLowerCase().replace(/\s+/g, ''));

        return filters.selectedWeights.some(w => {
          const wClean = w.toLowerCase().replace(/\s+/g, '');
          if (wClean.includes('800')) {
            return unitStrings.some(u => {
              const match = u.match(/(\d+)\s*g/);
              return match && parseInt(match[1], 10) >= 800;
            });
          }
          return unitStrings.some(u => u.includes(wClean));
        });
      });
    }

    // 4. Dietary Preference Filter
    if (filters.dietaryPreferences.length > 0) {
      result = result.filter(p => {
        const text = `${p.name} ${p.category} ${p.description}`.toLowerCase();
        return filters.dietaryPreferences.every(pref => {
          if (pref === 'jain') {
            return (
              text.includes('jain') ||
              !text.includes('garlic') && !text.includes('onion')
            );
          }
          if (pref === 'no-onion-garlic') {
            return !text.includes('garlic') && !text.includes('onion');
          }
          return true;
        });
      });
    }

    // 5. Rating Filter
    if (filters.minRating !== null) {
      result = result.filter(p => {
        const rating =
          p.totalRating && p.totalNumberOfUserRating
            ? p.totalRating / p.totalNumberOfUserRating
            : 4.5;
        return rating >= (filters.minRating as number);
      });
    }

    // 6. Sorting
    result.sort((a, b) => {
      const priceA = a.unitPrice1 ?? a.price ?? 0;
      const priceB = b.unitPrice1 ?? b.price ?? 0;
      const ratingA =
        a.totalRating && a.totalNumberOfUserRating
          ? a.totalRating / a.totalNumberOfUserRating
          : 4.5;
      const ratingB =
        b.totalRating && b.totalNumberOfUserRating
          ? b.totalRating / b.totalNumberOfUserRating
          : 4.5;

      switch (sortBy) {
        case 'priceAsc':
          return priceA - priceB;
        case 'priceDesc':
          return priceB - priceA;
        case 'rating':
          return ratingB - ratingA;
        case 'newest':
          return (b.uid || '').localeCompare(a.uid || '');
        case 'popularity':
        default:
          if (a.isBestseller && !b.isBestseller) return -1;
          if (!a.isBestseller && b.isBestseller) return 1;
          return (
            (b.totalNumberOfUserRating || 100) -
            (a.totalNumberOfUserRating || 100)
          );
      }
    });

    return result;
  }, [initialProducts, filters, sortBy]);

  // Paginated Slice
  const totalProducts = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalProducts);
  const currentSlice = filteredProducts.slice(startIndex, endIndex);

  // Pagination Change Handler with Smooth Scroll
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    if (gridTopRef.current) {
      gridTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Helper for generating numbered pagination array
  const paginationItems = useMemo(() => {
    const items: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
    } else {
      if (currentPage <= 4) {
        items.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        items.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        items.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return items;
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D1508] flex flex-col">
      {/* ── 1. Showcase Header Banner ── */}
      <ShopHeaderBanner 
        products={initialProducts} 
        title={
          isFlashSale 
            ? "Special Offers & Flash Sales" 
            : initialSort === 'bestseller' 
              ? "Bestselling Delicacies" 
              : undefined
        }
        subtitle={
          isFlashSale 
            ? "Enjoy limited-time discounts on handcrafted Gujarati namkeens, sweets, and fresh snacks." 
            : initialSort === 'bestseller' 
              ? "Discover the most loved, top-rated farsan and sweet assortments chosen by thousands of families." 
              : undefined
        }
        badge={
          isFlashSale 
            ? "LIMITED TIME OFFERS" 
            : initialSort === 'bestseller' 
              ? "CUSTOMER FAVORITES" 
              : undefined
        }
      />

      {/* ── Main Container ── */}
      <div className="max-w-[1360px] mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16">
        {/* ── 2. Top Category Icon Carousel / Bar ── */}
        <ShopCategoryBar
          selectedCategory={filters.category}
          onSelectCategory={catId => updateFilters({ ...filters, category: catId })}
        />

        {/* ── 3. Filter Toolbar ── */}
        <div
          ref={gridTopRef}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-3.5 px-4 mb-6 bg-white rounded-2xl border border-[#EFE6DC] shadow-2xs"
        >
          {/* Left: Filters text & Clear All */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 font-bold text-sm text-[#2D1508]">
              <SlidersHorizontal size={16} className="text-[#733617]" />
              <span>Filters</span>
            </div>

            <button
              onClick={handleClearAll}
              className="text-xs font-semibold text-[#733617] hover:underline cursor-pointer transition-colors"
            >
              Clear All
            </button>

            {/* Mobile filter toggle trigger */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden ml-2 px-3 py-1 bg-[#FAF7F2] border border-[#E8DFD5] rounded-full text-xs font-semibold text-[#733617] flex items-center gap-1.5"
            >
              Adjust
            </button>
          </div>

          {/* Center / Right: Sort and Count */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
            {/* Sort by dropdown */}
            <div className="flex items-center gap-2 text-xs text-[#65544A]">
              <span className="font-medium text-[#733617]">Sort by:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => {
                    setSortBy(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-white border border-[#E8DFD5] hover:border-[#733617] rounded-lg px-3 py-1.5 text-xs text-[#2D1508] font-semibold cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#733617] pr-7 transition-colors"
                >
                  <option value="popularity">Popularity</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                  <option value="newest">Newest</option>
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A796F] pointer-events-none"
                />
              </div>
            </div>

            {/* Product Counter */}
            <div className="text-xs text-[#8A796F] font-medium">
              Showing{' '}
              <span className="text-[#2D1508] font-bold">
                {totalProducts === 0 ? 0 : `${startIndex + 1}-${endIndex}`}
              </span>{' '}
              of{' '}
              <span className="text-[#2D1508] font-bold">
                {totalProducts}
              </span>{' '}
              products
            </div>
          </div>
        </div>

        {/* ── 4. Main Two-Column Layout ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 lg:gap-8 items-start">
          {/* Left Column: Filter Sidebar (Desktop) */}
          <div className="hidden md:block md:col-span-1 bg-white p-5 rounded-2xl border border-[#EFE6DC] shadow-2xs sticky top-28">
            <ShopSidebarFilters
              filters={filters}
              onFilterChange={updateFilters}
              onClearAll={handleClearAll}
              products={initialProducts}
            />
          </div>

          {/* Right Column: Product Grid (4 Columns) */}
          <div className="md:col-span-3 lg:col-span-4 flex flex-col">
            {totalProducts === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-2xl border border-[#EFE6DC] p-12 text-center flex flex-col items-center justify-center my-8">
                <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center text-3xl mb-4">
                  🔍
                </div>
                <h3 className="font-serif text-2xl text-[#2D1508] font-bold mb-2">
                  No Delicacies Found
                </h3>
                <p className="text-sm text-[#8A796F] max-w-md mb-6 leading-relaxed">
                  We couldn't find any products matching your current filters.
                  Try relaxing your price, weight, or category preferences.
                </p>
                <button
                  onClick={handleClearAll}
                  className="bg-[#733617] hover:bg-[#5A290F] text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw size={14} />
                  <span>Reset All Filters</span>
                </button>
              </div>
            ) : (
              <>
                {/* 4-Column Grid on Desktop */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5">
                  {currentSlice.map((product, idx) => {
                    const pid = product.uid || product.productID || '';
                    return (
                      <ShopProductCard
                        key={pid}
                        product={product}
                        priority={idx < 4}
                        isFavorited={favoriteIds.has(pid)}
                        onFavoriteToggle={handleFavoriteToggle}
                      />
                    );
                  })}
                </div>

                {/* ── 5. Numbered Circular Pagination ── */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 sm:gap-3 mt-12 pt-8 border-t border-[#EFE6DC]">
                    {/* Prev Arrow Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      aria-label="Previous page"
                      className="w-9 h-9 rounded-full border border-[#E8DFD5] bg-white flex items-center justify-center text-[#2D1508] hover:border-[#733617] hover:text-[#733617] disabled:opacity-30 disabled:pointer-events-none transition-colors shadow-2xs"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {/* Number Buttons */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {paginationItems.map((item, idx) => {
                        if (typeof item === 'string') {
                          return (
                            <span
                              key={`ellipsis-${idx}`}
                              className="px-1 text-xs text-[#8A796F] font-bold"
                            >
                              ...
                            </span>
                          );
                        }

                        const isCurrent = item === currentPage;
                        return (
                          <button
                            key={item}
                            onClick={() => handlePageChange(item)}
                            className={`w-9 h-9 rounded-full text-xs font-bold transition-all shadow-2xs ${
                              isCurrent
                                ? 'bg-[#733617] text-white scale-105'
                                : 'bg-white border border-[#E8DFD5] text-[#5A483D] hover:border-[#733617] hover:text-[#733617]'
                            }`}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>

                    {/* Next Arrow Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      aria-label="Next page"
                      className="w-9 h-9 rounded-full border border-[#E8DFD5] bg-white flex items-center justify-center text-[#2D1508] hover:border-[#733617] hover:text-[#733617] disabled:opacity-30 disabled:pointer-events-none transition-colors shadow-2xs"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Filter Drawer Modal ── */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Panel */}
          <div className="relative ml-auto w-4/5 max-w-sm h-full bg-white shadow-2xl p-5 overflow-y-auto flex flex-col z-10">
            <div className="flex items-center justify-between pb-4 border-b border-[#EFE6DC] mb-4">
              <span className="font-serif font-bold text-lg text-[#2D1508]">
                Filters
              </span>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF7F2] flex items-center justify-center text-[#733617]"
              >
                <X size={18} />
              </button>
            </div>

            <ShopSidebarFilters
              filters={filters}
              onFilterChange={updateFilters}
              onClearAll={handleClearAll}
              products={initialProducts}
            />

            <div className="mt-auto pt-4 border-t border-[#EFE6DC]">
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="w-full bg-[#733617] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                Show Results ({totalProducts})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. Bottom Feature Strip ── */}
      <FeatureStrip />
    </div>
  );
}
