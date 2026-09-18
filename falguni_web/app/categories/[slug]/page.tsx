'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { getProductsByCategory, getCategories, getSubCategories, getSubCategoryCollections } from '@/lib/firestore';
import type { ProductsModel, SubCategoryModel, SubCategoryCollectionModel } from '@/types';
import ProductCard from '@/components/ui/ProductCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageShell from '@/components/layout/PageShell';
import { SlidersHorizontal, ChevronDown, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CategoryProductsPage() {
  const { slug } = useParams<{ slug: string }>();
  const category = decodeURIComponent(slug);
  
  const [canonicalName, setCanonicalName] = useState(category);
  const [products, setProducts] = useState<ProductsModel[]>([]);
  const [adminSubCategories, setAdminSubCategories] = useState<SubCategoryModel[]>([]);
  const [categoryCollections, setCategoryCollections] = useState<SubCategoryCollectionModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryImage, setCategoryImage] = useState<string | null>(null);
  
  // UI State
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSub, setActiveSub] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const ITEMS_PER_PAGE = 16;

  // Fetch Data
  useEffect(() => {
    getCategories().then(async (cats) => {
      // Find matching category: exact match first, then alias or prefix match
      const targetNormalized = category.toUpperCase().replace(/[^\w]/g, '').replace(/V/g, 'W');
      
      let match = cats.find(c => (c.category || '').toUpperCase() === category.toUpperCase());
      
      if (!match) {
        match = cats.find(c => {
          const cNormalized = (c.category || '').toUpperCase().replace(/[^\w]/g, '').replace(/V/g, 'W');
          return cNormalized === targetNormalized || 
                 cNormalized.startsWith(targetNormalized) || 
                 targetNormalized.startsWith(cNormalized);
        });
      }

      const aliasMap: Record<string, string> = {
        'COMBOS': 'COMBOS & GIFT PACKS',
        'COMBO': 'COMBOS & GIFT PACKS',
        'MUKHVAS': 'MUKHWAS',
        'PICKLES': 'PICKLES & ACHAR',
        'PICKLE': 'PICKLES & ACHAR',
        'ACHAR': 'PICKLES & ACHAR',
        'FARSAN': 'FRIED / TRADITIONAL SNACKS',
        'GROUNDNUT': 'GROUNDNUT OIL PRODUCTS',
      };
      const aliasTarget = aliasMap[category.toUpperCase().replace(/[^\w]/g, '')];

      if (!match && aliasTarget) {
        match = cats.find(c => (c.category || '').toUpperCase() === aliasTarget);
      }

      const resolvedCategory = match ? match.category : category;
      setCanonicalName(resolvedCategory);
      if (match?.image) setCategoryImage(match.image);

      const [p, subs, cols] = await Promise.all([
        getProductsByCategory(resolvedCategory),
        getSubCategories(resolvedCategory),
        getSubCategoryCollections(resolvedCategory).catch(() => [] as SubCategoryCollectionModel[]),
      ]);
      setProducts(p);
      setAdminSubCategories(subs);
      setCategoryCollections(cols);
      setLoading(false);
    });
  }, [category]);

  // Derived Filters (Merges official admin subcategories with any product tags)
  const subcategories = useMemo(() => {
    const list: { name: string; image?: string; count: number }[] = [
      { name: 'All', count: products.length },
    ];
    const seen = new Set<string>();

    for (const sub of adminSubCategories) {
      const key = sub.name.toUpperCase();
      if (!seen.has(key)) {
        seen.add(key);
        const count = products.filter(p => (p.subCategory || '').toUpperCase() === key).length;
        list.push({ name: sub.name, image: sub.image, count });
      }
    }

    for (const p of products) {
      if (p.subCategory && p.subCategory.trim()) {
        const key = p.subCategory.trim().toUpperCase();
        if (!seen.has(key)) {
          seen.add(key);
          const count = products.filter(prod => (prod.subCategory || '').toUpperCase() === key).length;
          list.push({ name: p.subCategory.trim(), count });
        }
      }
    }
    return list;
  }, [products, adminSubCategories]);

  const filteredProducts = useMemo(() => {
    let arr = [...products];
    if (activeSub !== 'All') {
      arr = arr.filter(p => (p.subCategory || '').toUpperCase() === activeSub.toUpperCase());
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
      <div className="min-h-screen bg-[#FAF7F2] text-[#2D1508] flex flex-col pt-4 sm:pt-6 pb-20 sm:pb-28">
        <div className="max-w-[1360px] mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col gap-5 sm:gap-6">
          
          {/* ── 1. Left-aligned Breadcrumbs ── */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#8A796F] font-medium">
            <Link 
              href="/" 
              className="hover:text-[#733617] focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:outline-hidden rounded-xs transition-colors"
            >
              Home
            </Link>
            <span className="text-[#B5A599]" aria-hidden="true">&gt;</span>
            <Link 
              href="/categories" 
              className="hover:text-[#733617] focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:outline-hidden rounded-xs transition-colors"
            >
              All Categories
            </Link>
            <span className="text-[#B5A599]" aria-hidden="true">&gt;</span>
            <span className="text-[#733617] font-semibold" aria-current="page">
              {canonicalName}
            </span>
          </nav>

          {/* ── 2. Signature Category Hero Banner ── */}
          <header className="relative w-full overflow-hidden bg-white border border-[#EFE6DC] rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-12 shadow-xs">
            {/* Background Image Watermark */}
            {categoryImage && (
              <div className="absolute inset-0 z-0 pointer-events-none">
                <Image src={categoryImage} alt={canonicalName} fill className="object-cover opacity-10 object-center" priority />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
              </div>
            )}

            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] mb-3 text-[#733617]">
                <Sparkles size={12} className="text-[#C88A2C]" aria-hidden="true" />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">
                  Artisanal Collection • વિશિષ્ટ વાનગીઓ
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold text-[#2D1508] tracking-tight leading-tight mb-2">
                {canonicalName}
              </h1>

              <p className="text-xs sm:text-sm text-[#65544A] leading-relaxed mb-4">
                Handcrafted authentic Gujarati delicacies prepared with time-honored recipes, premium ingredients, and 100% pure edible oils.
              </p>

              {!loading && (
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#733617] bg-[#FAF7F2] border border-[#EFE6DC] px-3 py-1.5 rounded-xl">
                  <span>{products.length} {products.length === 1 ? 'Authentic Snack' : 'Authentic Delicacies'}</span>
                </div>
              )}
            </div>
          </header>

          {/* ── Curated Collections Strip ── */}
          {!loading && categoryCollections.length > 0 && (
            <div className="flex flex-col gap-3.5 bg-white/70 border border-[#EFE6DC] rounded-3xl p-4 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-serif font-bold text-[#2D1508] flex items-center gap-2">
                  <Sparkles size={14} className="text-[#C88A2C]" />
                  Curated Collections in {canonicalName}
                </h3>
                <Link
                  href="/collections"
                  className="text-xs font-bold text-[#733617] hover:underline"
                >
                  View All &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {categoryCollections.map((col) => {
                  const isFiltered = activeSub.toUpperCase() === (col.subCategory || '').toUpperCase();
                  return (
                    <button
                      key={col.uid || col.name}
                      onClick={() => {
                        if (col.subCategory) {
                          setActiveSub(col.subCategory);
                          setCurrentPage(1);
                        }
                      }}
                      className={`text-left group relative flex items-center gap-3.5 p-3 rounded-2xl border transition-all cursor-pointer ${
                        isFiltered
                          ? 'bg-[#733617]/5 border-[#733617] shadow-xs'
                          : 'bg-white hover:bg-[#FAF7F2] border-[#EFE6DC] hover:border-[#733617]/40 shadow-xs'
                      }`}
                    >
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-[#FAF7F2] border border-[#EFE6DC]">
                        {col.image ? (
                          <Image src={col.image} alt={col.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">✨</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#733617]">
                          {col.subCategory || 'Specialty'}
                        </span>
                        <h4 className="text-xs sm:text-sm font-serif font-bold text-[#2D1508] truncate group-hover:text-[#733617] transition-colors">
                          {col.name}
                        </h4>
                        <span className="text-[11px] text-[#8A796F] font-medium flex items-center gap-1 mt-0.5">
                          Click to filter products &rarr;
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── 3. Sub-category Pills & Filter Bar ── */}
          {!loading && products.length > 0 && (
            <div className="sticky top-[56px] md:top-[80px] z-40 w-full bg-white/95 backdrop-blur-xl border border-[#EFE6DC] rounded-2xl p-3 sm:p-4 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                
                {/* Left: Scrollable Subcategory Pills */}
                <div className="flex-1 overflow-x-auto scrollbar-hide -mx-1 px-1">
                  <div className="flex items-center gap-2 w-max pb-0.5">
                    {subcategories.map(sub => {
                      const isSelected = activeSub.toUpperCase() === sub.name.toUpperCase();
                      return (
                        <button
                          key={sub.name}
                          onClick={() => { setActiveSub(sub.name); setCurrentPage(1); }}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                            isSelected 
                              ? 'bg-[#733617] text-white shadow-xs' 
                              : 'bg-[#FAF7F2] text-[#65544A] hover:bg-[#EFE6DC] hover:text-[#2D1508] border border-[#EFE6DC]'
                          }`}
                        >
                          {sub.image && sub.name !== 'All' && (
                            <span className="relative w-4 h-4 rounded-full overflow-hidden shrink-0 border border-white/40">
                              <Image src={sub.image} alt={sub.name} fill className="object-cover" />
                            </span>
                          )}
                          <span>{sub.name}</span>
                          {sub.count !== undefined && sub.count > 0 && (
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-[#2D1508]/10 text-[#733617]'
                            }`}>
                              {sub.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Sort Controls */}
                <div className="flex items-center gap-2 shrink-0 ml-auto md:ml-0">
                  <div className="flex items-center gap-1.5 text-[#8A796F]">
                    <SlidersHorizontal size={13} />
                    <span className="text-xs font-bold tracking-wider uppercase">Sort:</span>
                  </div>
                  <div className="relative group">
                    <select 
                      value={sortBy}
                      onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                      className="appearance-none bg-[#FAF7F2] border border-[#EFE6DC] text-[#2D1508] text-xs font-bold tracking-wider uppercase rounded-xl pl-3 pr-8 py-2 outline-none focus:border-[#733617] cursor-pointer hover:bg-white transition-colors"
                    >
                      <option value="featured">Featured</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                    <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A796F] pointer-events-none group-hover:text-[#2D1508] transition-colors" />
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ── 4. Products Grid ── */}
          <div className="pt-2">
        {loading ? (
          <div className="py-32 flex justify-center"><LoadingSpinner /></div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-24 text-[#65544A] flex flex-col items-center justify-center animate-fade-up">
            <div className="w-20 h-20 mb-5 rounded-full border border-[#EFE6DC] bg-[#FAF7F2] flex items-center justify-center shadow-xs">
               <span className="text-3xl opacity-60">🔍</span>
            </div>
            <h3 className="text-xl font-serif font-bold text-[#2D1508] mb-2">No Delicacies Found</h3>
            <p className="max-w-sm mb-6 text-xs sm:text-sm text-[#65544A]">Try resetting your filters or selecting a different sub-category to discover our authentic treats.</p>
            <button 
              onClick={() => { setActiveSub('All'); setSortBy('featured'); }} 
              className="px-6 py-3 rounded-xl border border-[#733617] text-[#733617] hover:bg-[#FAF7F2] font-bold text-xs uppercase tracking-wider transition-all"
            >
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
                  className="px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[#F5EBE1] disabled:opacity-30 transition-all font-bold text-xs tracking-widest uppercase"
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
                            ? 'bg-[#733617] text-white shadow-sm scale-105'
                            : 'border border-[var(--color-border)] text-[var(--color-fg-muted)] hover:border-[#733617] hover:text-[var(--color-fg)] hover:bg-[#F5EBE1]'
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
                  className="px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[#F5EBE1] disabled:opacity-30 transition-all font-bold text-xs tracking-widest uppercase"
                >
                  NEXT
                </button>
              </div>
            )}
          </div>
        )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
