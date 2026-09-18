'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getCategories, getSubCategories } from '@/lib/firestore';
import type { CategoriesModel, SubCategoryModel } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageShell from '@/components/layout/PageShell';
import { 
  Search, 
  X, 
  ChevronRight, 
  Sparkles, 
  Flame, 
  Gift, 
  ShieldCheck, 
  Truck, 
  ArrowRight, 
  HeartHandshake,
  PackageCheck,
  Compass
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

interface CategoryMetadata {
  gujarati: string;
  englishTagline: string;
  description: string;
  badge: string;
  group: 'roasted' | 'savouries' | 'sweets' | 'combos' | 'all';
  featured?: boolean;
  popularTags: string[];
}

const CATEGORY_META_MAP: Record<string, CategoryMetadata> = {
  'KHAKHRA': {
    gujarati: 'ખારી, જીરું અને મસાલા ખાખરા',
    englishTagline: 'Traditional Roasted Wholewheat Crispbreads',
    description: 'Wafer-thin wholewheat crisps roasted slow on traditional iron tawas with zero preservatives. 100% roasted goodness vacuum packed for signature crunch.',
    badge: '100% ROASTED',
    group: 'roasted',
    featured: true,
    popularTags: ['Plain', 'Jeera', 'Methi', 'Chorafali', 'Dosa Khakhra', 'Masala', 'Diet Special', 'Pani Puri'],
  },
  'BHAKHRI': {
    gujarati: 'કાઠિયાવાડી ભાખરી અને બિસ્કિટ',
    englishTagline: 'Crispy Golden Wholewheat Delicacies',
    description: 'Thick, homestyle roasted wholewheat biscuits spiced with toasted cumin, fragrant fenugreek, and ajwain. A cherished pairing with afternoon masala chai.',
    badge: 'HOMESTYLE CRISP',
    group: 'roasted',
    popularTags: ['Jeera Bhakhri', 'Methi Bhakhri', 'Plain Bhakhri', 'Masala Bhakhri', 'Garlic Bhakhri'],
  },
  'FRIED / TRADITIONAL SNACKS': {
    gujarati: 'ચવાણું, સેવ અને ગાંઠિયા',
    englishTagline: 'Artisanal Gujarati Crunch & Festive Savouries',
    description: 'Classic festive farsan made from gram flour and aromatic whole spices, featuring soft-crisp Bhavnagari gathiya, spicy ratlami sev, and rich chavanu.',
    badge: 'FRESH SAVOURIES',
    group: 'savouries',
    popularTags: ['Bhavnagari Gathiya', 'Nylon Sev', 'Ratlam Sev', 'Mix Chavanu', 'Papdi Gathiya', 'Tikha Gathiya'],
  },
  'NAMKEEN': {
    gujarati: 'ચવાણું, સેવ અને ગાંઠિયા',
    englishTagline: 'Artisanal Gujarati Crunch & Festive Savouries',
    description: 'Classic festive farsan made from gram flour and aromatic whole spices, featuring soft-crisp Bhavnagari gathiya, spicy ratlami sev, and rich chavanu.',
    badge: 'FRESH SAVOURIES',
    group: 'savouries',
    popularTags: ['Bhavnagari Gathiya', 'Nylon Sev', 'Ratlam Sev', 'Mix Chavanu', 'Papdi Gathiya', 'Tikha Gathiya'],
  },
  'FARSAN': {
    gujarati: 'પરંપરાગત ગુજરાતી ફરસાણ',
    englishTagline: 'Time-Honored Homestyle Gujarati Snacks',
    description: 'Crunchy, freshly prepared regional delicacies prepared with heirloom spices and cold-pressed oil, perfect for everyday snacking and celebrations.',
    badge: 'AUTHENTIC FARSAN',
    group: 'savouries',
    popularTags: ['Bhavnagari Gathiya', 'Nylon Sev', 'Ratlam Sev', 'Mix Chavanu', 'Papdi Gathiya'],
  },
  'MUKHWAS': {
    gujarati: 'શાહી મુખવાસ અને પાન મસાલા',
    englishTagline: 'Royal Digestive Seed Blends & Mouth Fresheners',
    description: 'Pure roasted dhana dal, golden sesame, aromatic fennel, and royal herbal blends curated to aid digestion and leave a refreshing after-meal aroma.',
    badge: 'NATURAL DIGESTIVE',
    group: 'sweets',
    popularTags: ['Roasted Dhana Dal', 'Paan Mukhwas', 'Tilas Mukhwas', 'Gulkand Special', 'Alsi Seeds', 'Royal Saunf'],
  },
  'MUKHVAS': {
    gujarati: 'શાહી મુખવાસ અને પાન મસાલા',
    englishTagline: 'Royal Digestive Seed Blends & Mouth Fresheners',
    description: 'Pure roasted dhana dal, golden sesame, aromatic fennel, and royal herbal blends curated to aid digestion and leave a refreshing after-meal aroma.',
    badge: 'NATURAL DIGESTIVE',
    group: 'sweets',
    popularTags: ['Roasted Dhana Dal', 'Paan Mukhwas', 'Tilas Mukhwas', 'Gulkand Special', 'Alsi Seeds', 'Royal Saunf'],
  },
  'SWEETS': {
    gujarati: 'શુદ્ધ દેશી ઘી ની પરંપરાગત મીઠાઈ',
    englishTagline: 'Celebratory Mithai Crafted with Pure Cow Ghee',
    description: 'Authentic celebratory sweets slow-cooked in pure golden cow ghee, roasted gram flour, and dry fruits. Free from artificial preservatives and synthetic colors.',
    badge: '100% PURE GHEE',
    group: 'sweets',
    popularTags: ['Mohanthal', 'Magas', 'Kaju Katli', 'Penda', 'Adadiya Pak', 'Besan Laddoo'],
  },
  'COMBOS & GIFT PACKS': {
    gujarati: 'તહેવારો માટે ભેટ સોગાદ પેક',
    englishTagline: 'Curated Heritage Hampers & Festive Assortments',
    description: 'Elegantly packaged gift boxes bringing together our most celebrated khakhras, namkeens, and sweets. Perfect for Diwali, corporate gifting, and family visits.',
    badge: 'GIFT BOX READY',
    group: 'combos',
    popularTags: ['Festive Gift Box', 'Snack Assortment', 'Traveller Pack', 'Signature Khakhra Box'],
  },
  'COMBOS': {
    gujarati: 'તહેવારો માટે ભેટ સોગાદ પેક',
    englishTagline: 'Curated Heritage Hampers & Festive Assortments',
    description: 'Elegantly packaged gift boxes bringing together our most celebrated khakhras, namkeens, and sweets. Perfect for Diwali, corporate gifting, and family visits.',
    badge: 'GIFT BOX READY',
    group: 'combos',
    popularTags: ['Festive Gift Box', 'Snack Assortment', 'Traveller Pack', 'Signature Khakhra Box'],
  },
  'GROUNDNUT OIL PRODUCTS': {
    gujarati: 'શુદ્ધ સીંગતેલની સ્વાદિષ્ટ વાનગીઓ',
    englishTagline: 'Prepared in Cold-Pressed Saurashtra Groundnut Oil',
    description: 'Savory specialties fried and tempered exclusively in authentic, pure Saurashtra groundnut oil for a distinct nostalgic aroma and clean crispness.',
    badge: 'SAURASHTRA OIL',
    group: 'savouries',
    popularTags: ['Sing Bhujia', 'Peanut Chikki', 'Sing Pak', 'Spicy Peanuts'],
  },
  'PICKLES & ACHAR': {
    gujarati: 'ઘરગથ્થુ કાઠિયાવાડી અથાણાં અને છૂંદો',
    englishTagline: 'Sun-Cured Mango, Lime & Chili Preserves',
    description: 'Handmade Gujarati pickles aged in traditional ceramic barnis with cold-pressed mustard oil, fenugreek, and organic jaggery without chemical additives.',
    badge: 'SUN-CURED',
    group: 'combos',
    popularTags: ['Sweet Chhundo', 'Gor Keri', 'Methia Keri', 'Gunda Keri', 'Raiwala Marcha'],
  },
  'PICKLES': {
    gujarati: 'ઘરગથ્થુ કાઠિયાવાડી અથાણાં અને છૂંદો',
    englishTagline: 'Sun-Cured Mango, Lime & Chili Preserves',
    description: 'Handmade Gujarati pickles aged in traditional ceramic barnis with cold-pressed mustard oil, fenugreek, and organic jaggery without chemical additives.',
    badge: 'SUN-CURED',
    group: 'combos',
    popularTags: ['Sweet Chhundo', 'Gor Keri', 'Methia Keri', 'Gunda Keri', 'Raiwala Marcha'],
  },
};

const FILTER_TABS = [
  { id: 'all', label: 'All Collections' },
  { id: 'roasted', label: 'Roasted Snacks' },
  { id: 'savouries', label: 'Crispy Farsan' },
  { id: 'sweets', label: 'Sweets & Mukhwas' },
  { id: 'combos', label: 'Combos & Pickles' },
] as const;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoriesModel[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategoryModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<'all' | 'roasted' | 'savouries' | 'sweets' | 'combos'>('all');

  useEffect(() => {
    Promise.all([
      getCategories(),
      getSubCategories().catch(() => [] as SubCategoryModel[])
    ])
      .then(([cats, subs]) => {
        setCategories(cats);
        setSubCategories(subs);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load categories:', err);
        setLoading(false);
      });
  }, []);

  // Map subcategories by category key
  const subCategoryByCat = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const sub of subCategories) {
      if (sub.category && sub.name) {
        const key = sub.category.trim().toUpperCase();
        if (!map[key]) map[key] = [];
        if (!map[key].includes(sub.name)) {
          map[key].push(sub.name);
        }
      }
    }
    return map;
  }, [subCategories]);

  // Helper to fetch metadata with robust fallbacks
  const getMeta = useCallback((categoryName: string): CategoryMetadata => {
    const key = (categoryName || '').toUpperCase().trim();
    if (CATEGORY_META_MAP[key]) return CATEGORY_META_MAP[key];

    // Fuzzy check
    for (const [mapKey, meta] of Object.entries(CATEGORY_META_MAP)) {
      if (key.includes(mapKey) || mapKey.includes(key)) return meta;
    }

    // Default metadata fallback
    return {
      gujarati: 'પરંપરાગત સ્વાદ • શુદ્ધ વાનગીઓ',
      englishTagline: 'Fresh & Handcrafted Gujarati Delicacies',
      description: 'Authentic homemade snacks and culinary specialties prepared with pure ingredients and time-honored traditional recipes.',
      badge: 'ARTISANAL',
      group: 'all',
      popularTags: subCategoryByCat[key]?.slice(0, 5) || ['Freshly Prepared', 'Homestyle Taste', 'Pure Ingredients'],
    };
  }, [subCategoryByCat]);

  // Filter and search
  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return categories.filter((cat) => {
      const name = (cat.category || '').toLowerCase();
      const meta = getMeta(cat.category);
      const gujarati = meta.gujarati.toLowerCase();
      const tagline = meta.englishTagline.toLowerCase();
      const subs = (subCategoryByCat[(cat.category || '').toUpperCase()] || []).join(' ').toLowerCase();

      // Group filter
      if (selectedGroup !== 'all' && meta.group !== selectedGroup) {
        return false;
      }

      // Search query filter
      if (q) {
        const matchesName = name.includes(q);
        const matchesTagline = tagline.includes(q);
        const matchesGujarati = gujarati.includes(q);
        const matchesSubs = subs.includes(q);
        if (!matchesName && !matchesTagline && !matchesGujarati && !matchesSubs) {
          return false;
        }
      }

      return true;
    });
  }, [categories, searchQuery, selectedGroup, subCategoryByCat, getMeta]);

  return (
    <PageShell>
      <div className="min-h-screen bg-[#FAF7F2] text-[#2D1508] pt-4 sm:pt-6 pb-20 sm:pb-28">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb Hierarchy */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#733617]/70 font-medium mb-6">
            <Link href="/" className="hover:text-[#733617] transition-colors">
              Home
            </Link>
            <ChevronRight size={12} className="text-[#733617]/40" />
            <span className="text-[#2D1508] font-bold">All Categories</span>
          </nav>

          {/* ── Luxury Hero Banner ── */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#F5EBE1] via-[#FAF7F2] to-[#EFE6DC] border border-[#EFE6DC] rounded-3xl p-6 sm:p-10 md:p-14 mb-10 shadow-xs">
            {/* Background Texture & Warm Radial Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#D49B4B]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#733617]/5 rounded-full blur-2xl pointer-events-none -ml-16 -mb-16" />

            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#EFE6DC] text-[#733617] text-xs font-bold uppercase tracking-[0.2em] mb-4 shadow-xs">
                <Sparkles size={13} className="text-[#D49B4B]" />
                <span>પરંપરાગત વાનગીઓ • ARTISANAL COLLECTION</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#2D1508] tracking-tight mb-4">
                Explore Our Heritage Pantry
              </h1>

              <p className="text-sm sm:text-base text-[#65544A] leading-relaxed max-w-2xl mx-auto mb-8 font-normal">
                Authentic thin roasted khakhras, crisp golden bhakhris, fragrant farsan, pure cow ghee sweets, and royal mukhwas—handcrafted in Ahmedabad since 1978.
              </p>

              {/* Integrated Search Bar */}
              <div className="relative max-w-xl mx-auto">
                <div className="relative flex items-center bg-white rounded-2xl border border-[#EFE6DC] shadow-xs focus-within:border-[#733617] focus-within:ring-2 focus-within:ring-[#733617]/15 transition-all">
                  <Search size={18} className="text-[#733617] ml-4 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search categories or snacks (e.g. Khakhra, Bhakhri, Sev, Mukhwas)..."
                    className="w-full py-3.5 pl-3 pr-10 text-sm text-[#2D1508] placeholder-[#733617]/50 bg-transparent outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 p-1 rounded-full text-[#733617]/60 hover:text-[#733617] hover:bg-[#FAF7F2] transition-colors"
                      title="Clear search"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>

              {/* Curated Filter Tabs */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                {FILTER_TABS.map((tab) => {
                  const isActive = selectedGroup === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedGroup(tab.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-[#733617] text-white shadow-sm'
                          : 'bg-white/80 text-[#65544A] border border-[#EFE6DC] hover:bg-white hover:text-[#2D1508]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

            </div>
          </div>

          {/* ── Featured Spotlight: The Authentic Khakhra Archive ── */}
          {selectedGroup === 'all' && !searchQuery && (
            <div className="mb-12 bg-white rounded-3xl border border-[#EFE6DC] overflow-hidden shadow-xs">
              <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
                {/* Text Content */}
                <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] text-[#733617] text-[11px] font-bold uppercase tracking-wider mb-3">
                    <Flame size={13} className="text-[#D49B4B]" />
                    <span>FALGUNI SIGNATURE HERITAGE</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#2D1508] mb-3">
                    The Authentic Khakhra Archive
                  </h2>

                  <p className="text-sm sm:text-base text-[#65544A] leading-relaxed mb-6 font-normal">
                    Over 140+ varieties of paper-thin roasted crisps made from 100% stone-ground whole wheat, toasted cumin, fresh fenugreek, and heirloom Gujarati spices. Slow-roasted on cast-iron tawas with zero palm oil and multi-layer vacuum sealed for unmatched crispness.
                  </p>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="bg-[#FAF7F2] border border-[#EFE6DC] rounded-xl p-2.5 text-center">
                      <span className="block text-xs font-bold text-[#733617]">100% Roasted</span>
                      <span className="text-[10px] text-[#65544A]">Zero Frying</span>
                    </div>
                    <div className="bg-[#FAF7F2] border border-[#EFE6DC] rounded-xl p-2.5 text-center">
                      <span className="block text-xs font-bold text-[#733617]">140+ Flavours</span>
                      <span className="text-[10px] text-[#65544A]">Artisanal Range</span>
                    </div>
                    <div className="bg-[#FAF7F2] border border-[#EFE6DC] rounded-xl p-2.5 text-center">
                      <span className="block text-xs font-bold text-[#733617]">6-Month Seal</span>
                      <span className="text-[10px] text-[#65544A]">Vacuum Fresh</span>
                    </div>
                    <div className="bg-[#FAF7F2] border border-[#EFE6DC] rounded-xl p-2.5 text-center">
                      <span className="block text-xs font-bold text-[#733617]">Pure Ghee/Oil</span>
                      <span className="text-[10px] text-[#65544A]">Clean Nutrition</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    href="/categories/KHAKHRA"
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#733617] text-white text-sm font-bold shadow-md hover:bg-[#5A290F] hover:shadow-lg transition-all group"
                  >
                    <span>Browse 140+ Khakhra Delicacies</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* Visual Banner Frame */}
                <div className="lg:col-span-5 relative h-72 sm:h-96 lg:h-full min-h-[300px] bg-[#F5EBE1] border-t lg:border-t-0 lg:border-l border-[#EFE6DC] overflow-hidden">
                  <Image
                    src="/4_2.avif"
                    alt="Falguni Authentic Khakhra Collection"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    priority
                    className="object-cover object-center transform hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <span className="text-xs font-serif italic text-amber-200 block mb-1">Authentic Ahmedabad Recipe</span>
                    <span className="text-base sm:text-lg font-bold">Freshly Vacuum Sealed for International Travel</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Section Title & Count ── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6 pb-3 border-b border-[#EFE6DC]">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2D1508]">
                {selectedGroup === 'all' ? 'All Artisanal Categories' : FILTER_TABS.find(t => t.id === selectedGroup)?.label}
              </h2>
              <p className="text-xs text-[#65544A] mt-0.5">
                Browse our complete catalog of traditional snacks, sweets, and gourmet pantry staples
              </p>
            </div>
            <span className="text-xs font-bold text-[#733617] bg-[#FAF7F2] px-3 py-1 rounded-full border border-[#EFE6DC]">
              {filteredCategories.length} {filteredCategories.length === 1 ? 'Category' : 'Categories'} Available
            </span>
          </div>

          {/* ── Main Category Showcase Grid ── */}
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <LoadingSpinner />
              <p className="text-xs text-[#733617]/70 font-medium">Loading Falguni Heritage Categories...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#EFE6DC] p-12 text-center max-w-lg mx-auto shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center text-[#733617] mx-auto mb-4">
                <Compass size={24} />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#2D1508] mb-2">
                No Categories Found
              </h3>
              <p className="text-xs text-[#65544A] mb-6 leading-relaxed">
                We couldn&apos;t find any categories matching &quot;{searchQuery}&quot;. Try searching for general terms like &quot;Khakhra&quot;, &quot;Namkeen&quot;, or &quot;Sweets&quot;.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGroup('all');
                }}
                className="px-5 py-2.5 rounded-xl bg-[#733617] text-white text-xs font-bold hover:bg-[#5A290F] transition-colors"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {filteredCategories.map((cat, idx) => {
                const catName = cat.category || '';
                const meta = getMeta(catName);
                const subTags = subCategoryByCat[catName.toUpperCase()] || meta.popularTags;
                const encodedSlug = encodeURIComponent(catName);
                const imgSrc = cat.image || '/4_2.avif';

                return (
                  <Link
                    key={cat.uid || cat.id || catName}
                    href={`/categories/${encodedSlug}`}
                    className="group bg-white rounded-3xl border border-[#EFE6DC] overflow-hidden shadow-xs hover:shadow-xl hover:border-[#733617]/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <div>
                      {/* ── Category Image Frame ── */}
                      <div className="relative w-full aspect-[16/10] bg-[#F5EBE1] overflow-hidden">
                        <Image
                          src={imgSrc}
                          alt={catName}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          quality={70}
                          className="object-cover scale-100 group-hover:scale-108 transition-transform duration-700 ease-out"
                        />
                        {/* Dark gradient for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                        {/* Top Category Badge */}
                        <div className="absolute top-3.5 left-3.5 z-10">
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase bg-[#FAF7F2]/95 text-[#733617] border border-[#EFE6DC] shadow-xs backdrop-blur-xs">
                            {meta.badge}
                          </span>
                        </div>

                        {/* Gujarati Heritage Tagline over Image */}
                        <div className="absolute bottom-3 left-3.5 right-3.5 z-10 text-white">
                          <p className="text-xs font-serif text-amber-200 tracking-wide mb-0.5 drop-shadow-xs">
                            {meta.gujarati}
                          </p>
                          <h3 className="text-lg sm:text-xl font-serif font-bold tracking-tight text-white drop-shadow-sm line-clamp-1">
                            {catName}
                          </h3>
                        </div>
                      </div>

                      {/* ── Category Body Description ── */}
                      <div className="p-5 sm:p-6">
                        <p className="text-xs text-[#65544A] leading-relaxed line-clamp-2 mb-4 font-normal">
                          {meta.description}
                        </p>

                        {/* Subcategory Pill Tags */}
                        {subTags && subTags.length > 0 && (
                          <div className="mb-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#733617]/70 block mb-2">
                              POPULAR VARIETIES
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {subTags.slice(0, 4).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[11px] font-medium text-[#733617] bg-[#FAF7F2] px-2.5 py-1 rounded-lg border border-[#EFE6DC]"
                                >
                                  {tag}
                                </span>
                              ))}
                              {subTags.length > 4 && (
                                <span className="text-[10px] font-bold text-[#733617]/60 bg-transparent px-1.5 py-1">
                                  +{subTags.length - 4} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ── Card Bottom Action Bar ── */}
                    <div className="px-5 sm:px-6 py-3.5 border-t border-[#EFE6DC] bg-[#FAF7F2]/50 flex items-center justify-between">
                      <span className="text-xs font-bold text-[#733617] group-hover:text-[#5A290F] transition-colors">
                        Explore Collection
                      </span>
                      <div className="w-8 h-8 rounded-full bg-white border border-[#EFE6DC] flex items-center justify-center text-[#733617] group-hover:bg-[#733617] group-hover:text-white group-hover:border-[#733617] transition-all shadow-2xs">
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>

                  </Link>
                );
              })}
            </div>
          )}

          {/* ── Falguni Quality Assurance Pillars ── */}
          <div className="mt-16 pt-12 border-t border-[#EFE6DC]">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-[11px] font-bold text-[#733617] uppercase tracking-[0.2em] bg-[#FAF7F2] px-3 py-1 rounded-full border border-[#EFE6DC]">
                OUR ARTISANAL COMMITMENT
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D1508] mt-3 mb-2">
                Pure Homemade Goodness in Every Bite
              </h3>
              <p className="text-xs text-[#65544A] leading-relaxed">
                We craft our culinary specialties strictly adhering to ancestral recipes, honest ingredients, and rigorous cleanliness.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-[#EFE6DC] p-5 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center text-[#733617] mb-3">
                  <ShieldCheck size={20} />
                </div>
                <h4 className="text-sm font-bold text-[#2D1508] mb-1">100% Pure Ingredients</h4>
                <p className="text-xs text-[#65544A] leading-relaxed">
                  No artificial preservatives, no harmful palm oils, and no synthetic colorings—ever.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-[#EFE6DC] p-5 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center text-[#733617] mb-3">
                  <Flame size={20} />
                </div>
                <h4 className="text-sm font-bold text-[#2D1508] mb-1">Traditional Tawa Roast</h4>
                <p className="text-xs text-[#65544A] leading-relaxed">
                  Slowly pressed and roasted on thick iron plates for unmatched crunch and roasted aroma.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-[#EFE6DC] p-5 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center text-[#733617] mb-3">
                  <PackageCheck size={20} />
                </div>
                <h4 className="text-sm font-bold text-[#2D1508] mb-1">Multi-Layer Vacuum Seal</h4>
                <p className="text-xs text-[#65544A] leading-relaxed">
                  Export-grade vacuum packing retains optimal freshness and crunch for over 6 months.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-[#EFE6DC] p-5 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center text-[#733617] mb-3">
                  <Truck size={20} />
                </div>
                <h4 className="text-sm font-bold text-[#2D1508] mb-1">Direct from Ahmedabad</h4>
                <p className="text-xs text-[#65544A] leading-relaxed">
                  Fresh batches dispatched daily across India and internationally to the US, UK, and beyond.
                </p>
              </div>
            </div>
          </div>

          {/* ── Concierge & Bulk Gifting Banner ── */}
          <div className="mt-12 bg-gradient-to-r from-[#733617] to-[#4A200B] rounded-3xl p-7 sm:p-10 text-white shadow-md">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="max-w-xl text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-200 text-xs font-bold uppercase tracking-wider mb-3">
                  <Gift size={13} />
                  <span>FESTIVE & CORPORATE GIFTING</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold mb-2">
                  Need Custom Hampers or Bulk Orders?
                </h3>
                <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
                  We curate bespoke sweet and savory gift boxes for weddings, corporate celebrations, and festive distributions. Connect directly with our Vastrapur concierge.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <a
                  href="https://api.whatsapp.com/send?phone=919825382002&text=Hello%20Falguni%20Gruh%20Udhyog,%20I%20would%20like%20inquire%20about%20bulk%20orders%20and%20categories."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:bg-[#1EBE5D] transition-colors shadow-sm"
                >
                  <FaWhatsapp size={16} />
                  <span>Chat on WhatsApp</span>
                </a>
                <Link
                  href="/contact"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-[#733617] text-xs font-bold hover:bg-[#FAF7F2] transition-colors shadow-sm"
                >
                  <HeartHandshake size={15} />
                  <span>Direct Inquiry</span>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </PageShell>
  );
}
