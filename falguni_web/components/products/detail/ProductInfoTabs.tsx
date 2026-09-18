'use client';

import { useState, useMemo } from 'react';
import type { ProductsModel } from '@/types';
import { Coffee, Sun, Compass, Cookie, Gift, Sparkles, ShieldAlert, Clock } from 'lucide-react';

interface ProductInfoTabsProps {
  product: ProductsModel;
}

type TabKey = 'about' | 'ingredients' | 'nutrition' | 'allergens' | 'storage';

export default function ProductInfoTabs({ product }: ProductInfoTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('about');

  // Parse product description and extract key sections dynamically
  const { mainText, noteText, ingredientsList } = useMemo(() => {
    const raw = product.description || '';
    
    // Extract note if present (e.g. NOTE:-VACUUM PACKING CHARGES INCLUDED)
    const noteMatch = raw.match(/NOTE\s*[:-]+\s*(.*)$/im);
    const note = noteMatch ? noteMatch[1].trim() : '';

    // Clean text without note
    const withoutNote = raw.replace(/NOTE\s*[:-]+.*$/im, '').trim();

    // Extract ingredients if mentioned in text
    let ingredients: string[] = [];
    const ingMatch = withoutNote.match(/(?:made with|ingredients?)\s*[:\-]?\s*([^.]+)/i);
    if (ingMatch && ingMatch[1]) {
      ingredients = ingMatch[1]
        .split(/,|\band\b/i)
        .map((s) => s.replace(/\*\*/g, '').trim())
        .filter((s) => s.length > 1 && s.length < 50);
    }

    // Clean markdown asterisks
    const cleanedText = withoutNote.replace(/\*\*/g, '');

    return {
      mainText: cleanedText,
      noteText: note,
      ingredientsList: ingredients,
    };
  }, [product.description]);

  // Derived category label for titles
  const categoryLabel = product.category
    ? product.category.charAt(0).toUpperCase() + product.category.slice(1).toLowerCase()
    : 'Product';

  // Derived shelf life based on category
  const shelfLifeInfo = useMemo(() => {
    const cat = (product.category || '').toUpperCase();
    if (cat.includes('KHAKHRA') || cat.includes('BAKERY')) {
      return { duration: '6 Months', detail: 'Crisp & fresh when stored in airtight container' };
    }
    if (cat.includes('SWEET')) {
      return { duration: '30 Days', detail: 'Consume within 7 days once opened; keep refrigerated where recommended' };
    }
    if (cat.includes('PICKLE') || cat.includes('MUKHVAS')) {
      return { duration: '12 Months', detail: 'Use a dry spoon; store away from direct heat & moisture' };
    }
    return { duration: '4 Months', detail: 'Store in a cool, dry place away from direct sunlight' };
  }, [product.category]);

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'about', label: 'About Product' },
    { key: 'ingredients', label: 'Ingredients' },
    { key: 'nutrition', label: 'Nutrition Information' },
    { key: 'allergens', label: 'Allergen Information' },
    { key: 'storage', label: 'Storage & Shelf Life' },
  ];

  return (
    <div className="w-full bg-white border border-[#EFE6DC] rounded-3xl p-6 sm:p-8 lg:p-10 mb-8 shadow-xs">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Left Column: Vertical Tabs Selector (3 cols) ── */}
        <div className="lg:col-span-3 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-left transition-all duration-200 shrink-0 lg:shrink cursor-pointer border ${
                  isActive
                    ? 'bg-[#733617] text-white border-[#733617] shadow-xs'
                    : 'bg-white text-[#4A3B32] border-[#EFE6DC] hover:bg-[#FAF7F2] hover:border-[#733617]/30'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Center Column: Dynamic Content Panel (6 cols) ── */}
        <div className="lg:col-span-6 flex flex-col items-start text-left min-h-[200px]">
          {/* 1. About Product */}
          {activeTab === 'about' && (
            <div className="w-full animate-fade-in">
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#2D1508] mb-3">
                About this {categoryLabel}
              </h3>
              <p className="text-xs sm:text-sm text-[#65544A] leading-relaxed whitespace-pre-line font-normal mb-4">
                {mainText ||
                  `Authentic handcrafted ${product.name} prepared with premium ingredients following traditional Gujarati culinary methods. Perfectly seasoned for a crisp and savory delight.`}
              </p>

              {noteText && (
                <div className="mt-4 p-3 rounded-xl bg-[#FAF7F2] border border-[#EFE6DC] flex items-center gap-2 text-xs text-[#733617] font-semibold">
                  <Sparkles size={16} className="shrink-0" />
                  <span>{noteText}</span>
                </div>
              )}
            </div>
          )}

          {/* 2. Ingredients */}
          {activeTab === 'ingredients' && (
            <div className="w-full animate-fade-in">
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#2D1508] mb-3">
                Ingredients &amp; Spices
              </h3>
              {ingredientsList.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-4">
                  {ingredientsList.map((ing, i) => (
                    <span
                      key={i}
                      className="px-3.5 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#EFE6DC] text-xs font-semibold text-[#2D1508]"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-[#65544A] leading-relaxed mb-4">
                  Whole Wheat Flour, Edible Vegetable Oil, Handpicked Spices &amp; Condiments, Iodised Salt, Traditional Masala Seasoning.
                </p>
              )}
              <p className="text-[11px] text-[#8A796F]">
                * Crafted without artificial preservatives, synthetic colors, or chemical additives.
              </p>
            </div>
          )}

          {/* 3. Nutrition Information */}
          {activeTab === 'nutrition' && (
            <div className="w-full animate-fade-in">
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#2D1508] mb-3">
                Nutritional Profile (Approx. per 100g)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full">
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EFE6DC]">
                  <p className="text-[10px] uppercase font-bold text-[#8A796F]">Energy</p>
                  <p className="text-sm font-bold text-[#2D1508] mt-0.5">460 kcal</p>
                </div>
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EFE6DC]">
                  <p className="text-[10px] uppercase font-bold text-[#8A796F]">Protein</p>
                  <p className="text-sm font-bold text-[#2D1508] mt-0.5">9.2 g</p>
                </div>
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EFE6DC]">
                  <p className="text-[10px] uppercase font-bold text-[#8A796F]">Carbohydrates</p>
                  <p className="text-sm font-bold text-[#2D1508] mt-0.5">62.5 g</p>
                </div>
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EFE6DC]">
                  <p className="text-[10px] uppercase font-bold text-[#8A796F]">Dietary Fiber</p>
                  <p className="text-sm font-bold text-[#2D1508] mt-0.5">6.8 g</p>
                </div>
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EFE6DC]">
                  <p className="text-[10px] uppercase font-bold text-[#8A796F]">Total Fat</p>
                  <p className="text-sm font-bold text-[#2D1508] mt-0.5">18.4 g</p>
                </div>
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EFE6DC]">
                  <p className="text-[10px] uppercase font-bold text-[#8A796F]">Trans Fat</p>
                  <p className="text-sm font-bold text-[#2D1508] mt-0.5">0.0 g</p>
                </div>
              </div>
            </div>
          )}

          {/* 4. Allergen Information */}
          {activeTab === 'allergens' && (
            <div className="w-full animate-fade-in">
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#2D1508] mb-3">
                Dietary &amp; Allergen Declarations
              </h3>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-xs text-[#2D1508] font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-600" />
                  <span>100% Pure Vegetarian (Green Dot Certified)</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-[#65544A]">
                  <ShieldAlert size={16} className="text-[#D49B4B] shrink-0 mt-0.5" />
                  <span>
                    <strong>Allergen Notice:</strong> Contains Wheat (Gluten). Processed in a facility that also handles Sesame Seeds, Peanuts, Tree Nuts, and Dairy.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 5. Storage & Shelf Life */}
          {activeTab === 'storage' && (
            <div className="w-full animate-fade-in">
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#2D1508] mb-3">
                Storage Instructions &amp; Shelf Life
              </h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs text-[#2D1508] font-semibold">
                  <Clock size={16} className="text-[#733617]" />
                  <span>Best Before: {shelfLifeInfo.duration} from date of manufacturing</span>
                </div>
                <p className="text-xs text-[#65544A] leading-relaxed">
                  {shelfLifeInfo.detail}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Right Column: "Perfect For" Card (3 cols) ── */}
        <div className="lg:col-span-3 bg-[#FAF7F2] border border-[#EFE6DC] rounded-2xl p-5 w-full">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#733617] mb-4 flex items-center gap-1.5">
            <span className="w-1.5 h-3.5 bg-[#733617] rounded-full inline-block" />
            Perfect For
          </h4>

          <ul className="flex flex-col gap-3.5 text-xs font-semibold text-[#2D1508]">
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-[#EFE6DC] flex items-center justify-center text-[#733617] shrink-0">
                <Coffee size={15} />
              </div>
              <span>Tea Time</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-[#EFE6DC] flex items-center justify-center text-[#733617] shrink-0">
                <Sun size={15} />
              </div>
              <span>Breakfast</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-[#EFE6DC] flex items-center justify-center text-[#733617] shrink-0">
                <Compass size={15} />
              </div>
              <span>Travel &amp; Tiffin</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-[#EFE6DC] flex items-center justify-center text-[#733617] shrink-0">
                <Cookie size={15} />
              </div>
              <span>Everyday Snacking</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-[#EFE6DC] flex items-center justify-center text-[#733617] shrink-0">
                <Gift size={15} />
              </div>
              <span>Festive Gifting</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
