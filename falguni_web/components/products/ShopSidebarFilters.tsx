'use client';

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Star, Check } from 'lucide-react';
import type { ProductsModel } from '@/types';

export interface FilterState {
  category: string;
  subCategory?: string;
  priceRange: 'all' | 'under100' | '100-200' | '200-300' | 'above300' | 'custom';
  customMinPrice: string;
  customMaxPrice: string;
  appliedMinPrice: number | null;
  appliedMaxPrice: number | null;
  selectedWeights: string[];
  dietaryPreferences: string[];
  minRating: number | null;
}

interface ShopSidebarFiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onClearAll: () => void;
  products: ProductsModel[];
}

export default function ShopSidebarFilters({
  filters,
  onFilterChange,
  onClearAll: _onClearAll,
  products,
}: ShopSidebarFiltersProps) {
  // Accordion collapsed states
  const [openSections, setOpenSections] = useState({
    categories: true,
    subcategories: true,
    price: true,
    weight: true,
    dietary: true,
    ratings: true,
  });

  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllSubCategories, setShowAllSubCategories] = useState(false);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Compute live category counts based on entire dataset
  const categoryCounts = {
    all: products.length,
    khakhra: products.filter(p =>
      p.category?.toLowerCase().includes('khakhra') ||
      p.name.toLowerCase().includes('khakhra')
    ).length,
    bhakhri: products.filter(p =>
      p.category?.toLowerCase().includes('bhakhri') ||
      p.name.toLowerCase().includes('bhakhri')
    ).length,
    'groundnut-oil-products': products.filter(p =>
      p.category?.toLowerCase().includes('groundnut') ||
      p.name.toLowerCase().includes('groundnut')
    ).length,
    namkeen: products.filter(p =>
      p.category?.toLowerCase().includes('namkeen') ||
      p.name.toLowerCase().includes('namkeen') ||
      p.name.toLowerCase().includes('sev') ||
      p.name.toLowerCase().includes('gathiya') ||
      p.name.toLowerCase().includes('mixture')
    ).length,
    farsan: products.filter(p =>
      p.category?.toLowerCase().includes('farsan') ||
      p.name.toLowerCase().includes('farsan') ||
      p.name.toLowerCase().includes('bhakharwadi') ||
      p.name.toLowerCase().includes('khaman')
    ).length,
    mukhvas: products.filter(p =>
      p.category?.toLowerCase().includes('mukhva') ||
      p.name.toLowerCase().includes('mukhva')
    ).length,
    pickles: products.filter(p =>
      p.category?.toLowerCase().includes('pickle') ||
      p.name.toLowerCase().includes('pickle') ||
      p.name.toLowerCase().includes('achar')
    ).length,
    sweets: products.filter(p =>
      p.category?.toLowerCase().includes('sweet') ||
      p.name.toLowerCase().includes('ladoo') ||
      p.name.toLowerCase().includes('katli') ||
      p.name.toLowerCase().includes('halwa')
    ).length,
    bakery: products.filter(p =>
      p.category?.toLowerCase().includes('bakery') ||
      p.name.toLowerCase().includes('cookie') ||
      p.name.toLowerCase().includes('toast') ||
      p.name.toLowerCase().includes('biscuit')
    ).length,
    papad: products.filter(p =>
      p.category?.toLowerCase().includes('papad') ||
      p.name.toLowerCase().includes('papad')
    ).length,
    combos: products.filter(p =>
      p.category?.toLowerCase().includes('combo') ||
      p.name.toLowerCase().includes('combo') ||
      p.name.toLowerCase().includes('pack')
    ).length,
  };

  const CATEGORY_LIST = [
    { id: 'all', label: 'All Products', count: categoryCounts.all },
    { id: 'khakhra', label: 'Khakhra', count: categoryCounts.khakhra || 0 },
    { id: 'bhakhri', label: 'Bhakhri', count: categoryCounts.bhakhri || 0 },
    { id: 'groundnut-oil-products', label: 'Groundnut Oil Products', count: categoryCounts['groundnut-oil-products'] || 0 },
    { id: 'namkeen', label: 'Namkeen', count: categoryCounts.namkeen || 0 },
    { id: 'farsan', label: 'Farsan', count: categoryCounts.farsan || 0 },
    { id: 'mukhvas', label: 'Mukhvas', count: categoryCounts.mukhvas || 0 },
    { id: 'pickles', label: 'Pickles', count: categoryCounts.pickles || 0 },
    { id: 'sweets', label: 'Sweets', count: categoryCounts.sweets || 0 },
    { id: 'bakery', label: 'Bakery', count: categoryCounts.bakery || 0 },
    { id: 'papad', label: 'Papad', count: categoryCounts.papad || 0 },
    { id: 'combos', label: 'Combo Packs', count: categoryCounts.combos || 0 },
  ];

  const visibleCategories = showAllCategories
    ? CATEGORY_LIST
    : CATEGORY_LIST.slice(0, 6);

  // Dynamically derive available subcategories based on current pool
  const subCategoryList = useMemo(() => {
    const activeCat = (filters.category || 'all').toLowerCase();
    let pool = products;
    if (activeCat !== 'all') {
      const kw = activeCat === 'groundnut-oil-products' ? 'groundnut' : activeCat;
      pool = pool.filter(p =>
        (p.category || '').toLowerCase().includes(kw) ||
        (p.name || '').toLowerCase().includes(kw)
      );
    }
    const map = new Map<string, number>();
    for (const p of pool) {
      if (p.subCategory && p.subCategory.trim()) {
        const s = p.subCategory.trim();
        map.set(s, (map.get(s) || 0) + 1);
      }
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [products, filters.category]);

  // Weight options
  const WEIGHT_OPTIONS = [
    { id: '200g', label: '200g' },
    { id: '250g', label: '250g' },
    { id: '400g', label: '400g' },
    { id: '500g', label: '500g' },
    { id: '800g', label: '800g & above' },
  ];

  // Dietary options
  const DIETARY_OPTIONS = [
    { id: 'jain', label: 'Jain Friendly' },
    { id: 'no-onion-garlic', label: 'No Onion No Garlic' },
  ];

  // Custom price apply
  const handleApplyCustomPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const min = filters.customMinPrice ? Number(filters.customMinPrice) : null;
    const max = filters.customMaxPrice ? Number(filters.customMaxPrice) : null;
    onFilterChange({
      ...filters,
      priceRange: 'custom',
      appliedMinPrice: min,
      appliedMaxPrice: max,
    });
  };

  return (
    <aside className="w-full flex flex-col gap-6 text-[#2D1508] select-none">
      {/* ── Section 1: Categories ── */}
      <div className="border-b border-[#EFE6DC] pb-5">
        <button
          onClick={() => toggleSection('categories')}
          className="w-full flex items-center justify-between font-bold text-sm text-[#2D1508] mb-3.5"
        >
          <span>Categories</span>
          {openSections.categories ? (
            <ChevronUp size={16} className="text-[#8A796F]" />
          ) : (
            <ChevronDown size={16} className="text-[#8A796F]" />
          )}
        </button>

        {openSections.categories && (
          <div className="flex flex-col gap-2.5">
            {visibleCategories.map(cat => {
              const isChecked =
                filters.category === cat.id ||
                (!filters.category && cat.id === 'all');
              return (
                <label
                  key={cat.id}
                  className="flex items-center justify-between text-xs cursor-pointer group hover:text-[#733617] transition-colors py-0.5"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      onClick={() =>
                        onFilterChange({ ...filters, category: cat.id })
                      }
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        isChecked
                          ? 'bg-[#733617] border-[#733617] text-white'
                          : 'border-[#D9C7B6] bg-white group-hover:border-[#733617]'
                      }`}
                    >
                      {isChecked && <Check size={11} strokeWidth={3} />}
                    </div>
                    <span
                      onClick={() =>
                        onFilterChange({ ...filters, category: cat.id })
                      }
                      className={`transition-colors ${
                        isChecked
                          ? 'font-bold text-[#733617]'
                          : 'text-[#5A483D]'
                      }`}
                    >
                      {cat.label}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#8A796F] font-medium">
                    ({cat.count})
                  </span>
                </label>
              );
            })}

            {/* View More / View Less */}
            <button
              onClick={() => setShowAllCategories(prev => !prev)}
              className="text-left text-xs font-bold text-[#733617] hover:underline pt-1 transition-colors"
            >
              {showAllCategories ? '- View Less' : '+ View More'}
            </button>
          </div>
        )}
      </div>

      {/* ── Section 1B: Sub Categories ── */}
      {subCategoryList.length > 0 && (
        <div className="border-b border-[#EFE6DC] pb-5">
          <button
            onClick={() => toggleSection('subcategories')}
            className="w-full flex items-center justify-between font-bold text-sm text-[#2D1508] mb-3.5"
          >
            <span>Sub Category</span>
            {openSections.subcategories ? (
              <ChevronUp size={16} className="text-[#8A796F]" />
            ) : (
              <ChevronDown size={16} className="text-[#8A796F]" />
            )}
          </button>

          {openSections.subcategories && (
            <div className="flex flex-col gap-2.5">
              <label
                onClick={() => onFilterChange({ ...filters, subCategory: 'all' })}
                className="flex items-center justify-between text-xs text-[#5A483D] cursor-pointer group hover:text-[#733617] transition-colors py-0.5"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      !filters.subCategory || filters.subCategory === 'all'
                        ? 'border-[#733617]'
                        : 'border-[#D9C7B6] bg-white group-hover:border-[#733617]'
                    }`}
                  >
                    {(!filters.subCategory || filters.subCategory === 'all') && (
                      <div className="w-2 h-2 rounded-full bg-[#733617]" />
                    )}
                  </div>
                  <span className={!filters.subCategory || filters.subCategory === 'all' ? 'font-bold text-[#733617]' : ''}>
                    All Subcategories
                  </span>
                </div>
              </label>

              {(showAllSubCategories ? subCategoryList : subCategoryList.slice(0, 6)).map((sub: { name: string; count: number }) => {
                const isSelected = (filters.subCategory || '').toLowerCase() === sub.name.toLowerCase();
                return (
                  <label
                    key={sub.name}
                    onClick={() => onFilterChange({ ...filters, subCategory: isSelected ? 'all' : sub.name })}
                    className="flex items-center justify-between text-xs text-[#5A483D] cursor-pointer group hover:text-[#733617] transition-colors py-0.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-1">
                      <div
                        className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'border-[#733617]'
                            : 'border-[#D9C7B6] bg-white group-hover:border-[#733617]'
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-[#733617]" />
                        )}
                      </div>
                      <span className={`truncate ${isSelected ? 'font-bold text-[#733617]' : ''}`}>
                        {sub.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#8A796F] shrink-0 font-medium">
                      ({sub.count})
                    </span>
                  </label>
                );
              })}

              {subCategoryList.length > 6 && (
                <button
                  onClick={() => setShowAllSubCategories(prev => !prev)}
                  className="text-left text-xs font-bold text-[#733617] hover:underline pt-1 transition-colors"
                >
                  {showAllSubCategories ? '- View Less' : `+ View More (${subCategoryList.length - 6})`}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Section 2: Price ── */}
      <div className="border-b border-[#EFE6DC] pb-5">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between font-bold text-sm text-[#2D1508] mb-3.5"
        >
          <span>Price</span>
          {openSections.price ? (
            <ChevronUp size={16} className="text-[#8A796F]" />
          ) : (
            <ChevronDown size={16} className="text-[#8A796F]" />
          )}
        </button>

        {openSections.price && (
          <div className="flex flex-col gap-2.5">
            {[
              { id: 'all', label: 'All' },
              { id: 'under100', label: 'Under ₹100' },
              { id: '100-200', label: '₹100 - ₹200' },
              { id: '200-300', label: '₹200 - ₹300' },
              { id: 'above300', label: 'Above ₹300' },
            ].map(tier => {
              const isSelected = filters.priceRange === tier.id;
              return (
                <label
                  key={tier.id}
                  onClick={() =>
                    onFilterChange({
                      ...filters,
                      priceRange: tier.id as any,
                      appliedMinPrice: null,
                      appliedMaxPrice: null,
                    })
                  }
                  className="flex items-center gap-2.5 text-xs text-[#5A483D] cursor-pointer group hover:text-[#733617] transition-colors py-0.5"
                >
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'border-[#733617]'
                        : 'border-[#D9C7B6] bg-white group-hover:border-[#733617]'
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-[#733617]" />
                    )}
                  </div>
                  <span className={isSelected ? 'font-bold text-[#733617]' : ''}>
                    {tier.label}
                  </span>
                </label>
              );
            })}

            {/* Custom Min / Max Inputs */}
            <form onSubmit={handleApplyCustomPrice} className="mt-2 pt-2 flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8A796F]">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.customMinPrice}
                    onChange={e =>
                      onFilterChange({
                        ...filters,
                        customMinPrice: e.target.value,
                      })
                    }
                    className="w-full bg-white border border-[#E8DFD5] rounded-md pl-6 pr-2 py-1 text-xs text-[#2D1508] focus:outline-hidden focus:border-[#733617]"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8A796F]">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.customMaxPrice}
                    onChange={e =>
                      onFilterChange({
                        ...filters,
                        customMaxPrice: e.target.value,
                      })
                    }
                    className="w-full bg-white border border-[#E8DFD5] rounded-md pl-6 pr-2 py-1 text-xs text-[#2D1508] focus:outline-hidden focus:border-[#733617]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#733617] hover:bg-[#5A290F] text-white py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
              >
                APPLY
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ── Section 3: Weight ── */}
      <div className="border-b border-[#EFE6DC] pb-5">
        <button
          onClick={() => toggleSection('weight')}
          className="w-full flex items-center justify-between font-bold text-sm text-[#2D1508] mb-3.5"
        >
          <span>Weight</span>
          {openSections.weight ? (
            <ChevronUp size={16} className="text-[#8A796F]" />
          ) : (
            <ChevronDown size={16} className="text-[#8A796F]" />
          )}
        </button>

        {openSections.weight && (
          <div className="flex flex-col gap-2.5">
            {WEIGHT_OPTIONS.map(wt => {
              const isChecked = filters.selectedWeights.includes(wt.id);
              return (
                <label
                  key={wt.id}
                  onClick={() => {
                    const next = isChecked
                      ? filters.selectedWeights.filter(w => w !== wt.id)
                      : [...filters.selectedWeights, wt.id];
                    onFilterChange({ ...filters, selectedWeights: next });
                  }}
                  className="flex items-center gap-2.5 text-xs text-[#5A483D] cursor-pointer group hover:text-[#733617] transition-colors py-0.5"
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      isChecked
                        ? 'bg-[#733617] border-[#733617] text-white'
                        : 'border-[#D9C7B6] bg-white group-hover:border-[#733617]'
                    }`}
                  >
                    {isChecked && <Check size={11} strokeWidth={3} />}
                  </div>
                  <span className={isChecked ? 'font-bold text-[#733617]' : ''}>
                    {wt.label}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Section 4: Dietary Preference ── */}
      <div className="border-b border-[#EFE6DC] pb-5">
        <button
          onClick={() => toggleSection('dietary')}
          className="w-full flex items-center justify-between font-bold text-sm text-[#2D1508] mb-3.5"
        >
          <span>Dietary Preference</span>
          {openSections.dietary ? (
            <ChevronUp size={16} className="text-[#8A796F]" />
          ) : (
            <ChevronDown size={16} className="text-[#8A796F]" />
          )}
        </button>

        {openSections.dietary && (
          <div className="flex flex-col gap-2.5">
            {DIETARY_OPTIONS.map(pref => {
              const isChecked = filters.dietaryPreferences.includes(pref.id);
              return (
                <label
                  key={pref.id}
                  onClick={() => {
                    const next = isChecked
                      ? filters.dietaryPreferences.filter(p => p !== pref.id)
                      : [...filters.dietaryPreferences, pref.id];
                    onFilterChange({ ...filters, dietaryPreferences: next });
                  }}
                  className="flex items-center gap-2.5 text-xs text-[#5A483D] cursor-pointer group hover:text-[#733617] transition-colors py-0.5"
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      isChecked
                        ? 'bg-[#733617] border-[#733617] text-white'
                        : 'border-[#D9C7B6] bg-white group-hover:border-[#733617]'
                    }`}
                  >
                    {isChecked && <Check size={11} strokeWidth={3} />}
                  </div>
                  <span className={isChecked ? 'font-bold text-[#733617]' : ''}>
                    {pref.label}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Section 5: Ratings ── */}
      <div className="pb-4">
        <button
          onClick={() => toggleSection('ratings')}
          className="w-full flex items-center justify-between font-bold text-sm text-[#2D1508] mb-3.5"
        >
          <span>Ratings</span>
          {openSections.ratings ? (
            <ChevronUp size={16} className="text-[#8A796F]" />
          ) : (
            <ChevronDown size={16} className="text-[#8A796F]" />
          )}
        </button>

        {openSections.ratings && (
          <div className="flex flex-col gap-2.5">
            {[5, 4, 3, 2].map(starThreshold => {
              const isSelected = filters.minRating === starThreshold;
              return (
                <button
                  key={starThreshold}
                  onClick={() => {
                    onFilterChange({
                      ...filters,
                      minRating: isSelected ? null : starThreshold,
                    });
                  }}
                  className={`flex items-center gap-2 text-xs py-1 px-1.5 rounded transition-colors text-left ${
                    isSelected
                      ? 'bg-[#FBF4EE] font-bold text-[#733617]'
                      : 'text-[#5A483D] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <div className="flex items-center gap-0.5 text-[#D49B4B]">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star
                        key={s}
                        size={12}
                        className={
                          s <= starThreshold
                            ? 'fill-[#D49B4B] text-[#D49B4B]'
                            : 'text-[#E0D5CA] fill-transparent'
                        }
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-[#8A796F] ml-1">
                    &amp; above
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
