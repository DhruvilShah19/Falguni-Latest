'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ChevronRight, ArrowUpRight, Search, Layers } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getSubCategoryCollections } from '@/lib/firestore';
import type { SubCategoryCollectionModel } from '@/types';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<SubCategoryCollectionModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    getSubCategoryCollections()
      .then((data) => {
        setCollections(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load collections:', err);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    collections.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return ['All', ...Array.from(set).sort()];
  }, [collections]);

  const filtered = useMemo(() => {
    return collections.filter((c) => {
      const matchCat =
        selectedCategory === 'All' ||
        (c.category || '').toUpperCase() === selectedCategory.toUpperCase();
      const query = searchQuery.toLowerCase().trim();
      const matchQuery =
        !query ||
        c.name.toLowerCase().includes(query) ||
        (c.category || '').toLowerCase().includes(query) ||
        (c.subCategory || '').toLowerCase().includes(query);
      return matchCat && matchQuery;
    });
  }, [collections, selectedCategory, searchQuery]);

  return (
    <PageShell>
      <div className="min-h-screen bg-[#FAF7F2] text-[#2D1508] pt-4 sm:pt-6 pb-20 sm:pb-28">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#733617]/70 font-medium mb-6">
            <Link href="/" className="hover:text-[#733617] transition-colors">
              Home
            </Link>
            <ChevronRight size={12} className="text-[#733617]/40" />
            <span className="text-[#2D1508] font-bold">Curated Collections</span>
          </nav>

          {/* Hero Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#F5EBE1] via-[#FAF7F2] to-[#EFE6DC] border border-[#EFE6DC] rounded-3xl p-6 sm:p-10 md:p-12 mb-10 shadow-xs">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#D49B4B]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#733617]/5 rounded-full blur-2xl pointer-events-none -ml-16 -mb-16" />

            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#EFE6DC] text-[#733617] text-xs font-bold uppercase tracking-[0.2em] mb-4 shadow-xs">
                <Sparkles size={13} className="text-[#D49B4B]" />
                <span>વિશિષ્ટ સંગ્રહ • CURATED COLLECTIONS</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#2D1508] tracking-tight mb-4">
                Handcrafted Specialty Collections
              </h1>

              <p className="text-sm sm:text-base text-[#65544A] leading-relaxed max-w-2xl mx-auto mb-8 font-normal">
                Carefully selected assortments of authentic Gujarati snacks, roasted delicacies, and festive spreads crafted with timeless heritage recipes.
              </p>

              {/* Search */}
              <div className="relative max-w-md mx-auto">
                <div className="relative flex items-center bg-white rounded-2xl border border-[#EFE6DC] shadow-xs focus-within:border-[#733617] focus-within:ring-2 focus-within:ring-[#733617]/15 transition-all">
                  <Search size={18} className="text-[#733617] ml-4 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search collections..."
                    className="w-full py-3 pl-3 pr-4 text-sm text-[#2D1508] placeholder-[#733617]/50 bg-transparent outline-none"
                  />
                </div>
              </div>

              {/* Category Filter Chips */}
              {categories.length > 2 && (
                <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        selectedCategory === cat
                          ? 'bg-[#733617] text-white shadow-xs'
                          : 'bg-white/80 text-[#65544A] hover:bg-white hover:text-[#2D1508] border border-[#EFE6DC]'
                      }`}
                    >
                      {cat === 'All' ? 'All Collections' : cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner size={40} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#EFE6DC] max-w-lg mx-auto shadow-xs">
              <div className="w-16 h-16 rounded-full bg-[#FAF7F2] flex items-center justify-center mx-auto mb-4 text-[#733617]">
                <Layers size={28} />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#2D1508] mb-2">
                No Collections Found
              </h3>
              <p className="text-sm text-[#8A796F] mb-6 leading-relaxed">
                {searchQuery || selectedCategory !== 'All'
                  ? 'No curated collections matched your search filter.'
                  : 'New curated collections will be added soon.'}
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#733617] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5A290F] transition-colors"
              >
                Browse All Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filtered.map((item) => {
                const targetUrl = item.subCategory
                  ? `/products?category=${encodeURIComponent(item.category)}&subCategory=${encodeURIComponent(item.subCategory)}`
                  : item.category
                  ? `/products?category=${encodeURIComponent(item.category)}`
                  : '/products';

                return (
                  <Link
                    key={item.uid || item.id || item.name}
                    href={targetUrl}
                    className="group flex flex-col bg-white rounded-3xl border border-[#EFE6DC] overflow-hidden hover:shadow-xl hover:border-[#D4AF37]/50 transition-all duration-300"
                  >
                    {/* Collection Image */}
                    <div className="relative aspect-[16/10] w-full bg-[#FAF7F2] overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          ✨
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                      {/* Category Badge */}
                      {item.category && (
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[10px] font-bold uppercase tracking-wider text-[#733617] shadow-xs">
                            {item.category}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Collection Details */}
                    <div className="p-6 flex flex-col flex-grow justify-between">
                      <div>
                        {item.subCategory && (
                          <p className="text-[11px] font-semibold text-[#A07255] uppercase tracking-wider mb-1.5">
                            {item.subCategory}
                          </p>
                        )}
                        <h2 className="text-xl font-serif font-bold text-[#2D1508] group-hover:text-[#733617] transition-colors leading-snug">
                          {item.name}
                        </h2>
                      </div>

                      <div className="mt-6 pt-4 border-t border-[#F0E8DF] flex items-center justify-between">
                        <span className="text-xs font-bold text-[#733617] uppercase tracking-wider group-hover:underline">
                          Explore Collection
                        </span>
                        <div className="w-8 h-8 rounded-full bg-[#FAF7F2] group-hover:bg-[#733617] group-hover:text-white text-[#733617] flex items-center justify-center transition-all">
                          <ArrowUpRight size={16} />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
