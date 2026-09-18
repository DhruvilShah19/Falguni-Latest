'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Search, X, Star, Heart, ShoppingBag, 
  Check, SlidersHorizontal, ArrowLeft, Sparkles, 
  ArrowRight 
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { subscribeToFavorites, removeFromFavorites, addToCart, updateCartItem } from '@/lib/firestore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { ProductsModel } from '@/types';

interface Variant {
  name: string;
  price: number;
  unitIndex: number;
}

function FavoriteProductCard({ 
  product, 
  userId,
  onAnnounce
}: { 
  product: ProductsModel; 
  userId: string;
  onAnnounce: (msg: string) => void;
}) {
  const productId = product.productID || product.uid || '';
  const [isRemoving, setIsRemoving] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Extract variants from product
  const variants: Variant[] = useMemo(() => {
    const list: Variant[] = [];
    if (product.unitname1 && product.unitPrice1) list.push({ name: product.unitname1, price: product.unitPrice1, unitIndex: 1 });
    if (product.unitname2 && product.unitPrice2) list.push({ name: product.unitname2, price: product.unitPrice2, unitIndex: 2 });
    if (product.unitname3 && product.unitPrice3) list.push({ name: product.unitname3, price: product.unitPrice3, unitIndex: 3 });
    if (product.unitname4 && product.unitPrice4) list.push({ name: product.unitname4, price: product.unitPrice4, unitIndex: 4 });
    if (product.unitname5 && product.unitPrice5) list.push({ name: product.unitname5, price: product.unitPrice5, unitIndex: 5 });
    if (list.length === 0) list.push({ name: 'Standard Pack', price: product.unitPrice1 || 0, unitIndex: 1 });
    return list;
  }, [product]);

  const [selectedVariant, setSelectedVariant] = useState<Variant>(variants[0]);

  // Handle Remove from Favorites
  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isRemoving) return;
    setIsRemoving(true);
    try {
      await removeFromFavorites(userId, productId);
      onAnnounce(`${product.name} removed from your favorites.`);
    } catch (err) {
      console.error('Error removing favorite:', err);
      setIsRemoving(false);
    }
  };

  // Handle Add to Cart
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (addingToCart || addedToCart) return;

    setAddingToCart(true);
    try {
      const docId = `${product.vendorId || 'falguni'}_${productId}_unit${selectedVariant.unitIndex}`;
      const existing = useCartStore.getState().items.find(i => i.cartDocId === docId);

      if (existing) {
        const newQty = (existing.quantity || 1) + 1;
        await updateCartItem(userId, docId, {
          quantity: newQty,
          price: selectedVariant.price * newQty,
        });
      } else {
        await addToCart(
          userId,
          {
            ...product,
            selected: selectedVariant.name,
            selectedPrice: selectedVariant.price,
            price: selectedVariant.price,
            quantity: 1,
            cartDocId: docId,
          },
          docId
        );
      }

      setAddedToCart(true);
      onAnnounce(`${product.name} (${selectedVariant.name}) added to cart.`);
      setTimeout(() => setAddedToCart(false), 2200);
    } catch (err) {
      console.error('Error adding to cart:', err);
    } finally {
      setAddingToCart(false);
    }
  };

  // Calculate Rating
  const rating = product.totalNumberOfUserRating > 0
    ? (product.totalRating / product.totalNumberOfUserRating).toFixed(1)
    : '4.8';
  const reviewsCount = product.totalNumberOfUserRating || 24;

  return (
    <article
      aria-label={`${product.name} - ₹${selectedVariant.price}`}
      className={`bg-white rounded-2xl border border-[#EFE6DC] p-3.5 sm:p-4 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-[#733617]/30 transition-all group relative ${
        isRemoving ? 'opacity-0 scale-95 transition-all duration-300' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col flex-1">
        
        {/* ── Image Box with Vegetarian Mark & Remove Button ── */}
        <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-[#FAF7F2] flex items-center justify-center">
          
          {/* Indian Vegetarian Dot Mark */}
          <div 
            className="absolute top-2.5 left-2.5 z-10 w-4 h-4 bg-white/95 rounded-xs border border-green-700 flex items-center justify-center shadow-xs"
            title="100% Vegetarian"
            aria-label="100% Vegetarian"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-700" />
          </div>

          {/* Remove from Favorites Button */}
          <button
            type="button"
            onClick={handleRemove}
            disabled={isRemoving}
            aria-label={`Remove ${product.name} from favorites`}
            title="Remove from favorites"
            className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/95 border border-[#EFE6DC] text-red-500 hover:text-white hover:bg-red-600 hover:border-red-600 flex items-center justify-center transition-all shadow-xs focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:outline-hidden cursor-pointer"
          >
            <Heart size={14} className="fill-current" aria-hidden="true" />
          </button>

          {/* Product Photo */}
          <Link 
            href={`/products/${productId}`} 
            className="w-full h-full relative"
            aria-label={`View details of ${product.name}`}
          >
            {product.image1 ? (
              <Image
                src={product.image1}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#733617]/30 font-serif text-3xl">
                ✨
              </div>
            )}
          </Link>
        </div>

        {/* ── Category Kicker ── */}
        <div className="mb-1">
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#733617]">
            {product.category || 'Falguni Special'}
          </span>
        </div>

        {/* ── Title ── */}
        <Link href={`/products/${productId}`} className="group-hover:text-[#733617] transition-colors">
          <h3 className="font-serif font-bold text-sm sm:text-base text-[#2D1508] line-clamp-2 leading-snug mb-1.5">
            {product.name}
          </h3>
        </Link>

        {/* ── Rating & Reviews ── */}
        <div className="flex items-center gap-1.5 mb-3 text-xs text-[#65544A]">
          <div className="flex items-center text-[#D49B4B]">
            <Star size={12} className="fill-current" aria-hidden="true" />
          </div>
          <span className="font-bold text-[#2D1508] text-[11px]">{rating}</span>
          <span className="text-[11px] text-[#8A796F]">({reviewsCount})</span>
        </div>

        {/* ── Weight Variant Selector (if multiple exist) ── */}
        {variants.length > 1 && (
          <div className="mb-3">
            <label htmlFor={`variant-${productId}`} className="sr-only">
              Select Pack Size
            </label>
            <select
              id={`variant-${productId}`}
              value={selectedVariant.unitIndex}
              onChange={(e) => {
                const found = variants.find(v => v.unitIndex === Number(e.target.value));
                if (found) setSelectedVariant(found);
              }}
              className="w-full bg-[#FAF7F2] border border-[#EFE6DC] rounded-lg px-2.5 py-1.5 text-xs text-[#2D1508] font-medium outline-hidden focus:border-[#733617] focus-visible:ring-2 focus-visible:ring-[#733617] transition-all cursor-pointer"
            >
              {variants.map((v) => (
                <option key={v.unitIndex} value={v.unitIndex}>
                  {v.name} – ₹{v.price}
                </option>
              ))}
            </select>
          </div>
        )}

      </div>

      {/* ── Price & Add to Cart Footer ── */}
      <div className="pt-3 border-t border-[#FAF7F2] flex flex-col gap-2.5 mt-2">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-bold text-[#2D1508]">
              ₹{selectedVariant.price}
            </span>
            <span className="text-[11px] text-[#8A796F]">
              / {selectedVariant.name}
            </span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            In Stock
          </span>
        </div>

        {/* Add to Cart Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={addingToCart}
          aria-label={`Add ${product.name} to cart`}
          className={`w-full py-2.5 px-4 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:outline-hidden ${
            addedToCart 
              ? 'bg-emerald-700 text-white shadow-xs' 
              : 'bg-[#733617] hover:bg-[#5A290F] text-white shadow-xs'
          }`}
        >
          {addedToCart ? (
            <>
              <Check size={15} strokeWidth={2.5} aria-hidden="true" />
              <span>Added to Cart</span>
            </>
          ) : addingToCart ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
          ) : (
            <>
              <ShoppingBag size={14} aria-hidden="true" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>

    </article>
  );
}

export default function FavoritesInterface() {
  const { firebaseUser, loading: authLoading } = useAuthStore();
  const [favorites, setFavorites] = useState<ProductsModel[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [query, setQuery] = useState('');
  const [sortOption, setSortOption] = useState<'popular' | 'ratingHigh' | 'priceLow' | 'priceHigh'>('popular');
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (authLoading) return;
    
    if (!firebaseUser) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToFavorites(firebaseUser.uid, (items) => {
      setFavorites(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseUser, authLoading]);

  const handleAnnounce = (msg: string) => {
    setAnnouncement(msg);
    setTimeout(() => setAnnouncement(''), 3000);
  };

  const filteredResults = useMemo(() => {
    let filtered = [...favorites];

    if (query.trim()) {
      const lowerQuery = query.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) || 
        (p.category && p.category.toLowerCase().includes(lowerQuery)) ||
        (p.description && p.description.toLowerCase().includes(lowerQuery))
      );
    }

    if (sortOption === 'priceLow') {
      filtered.sort((a, b) => (a.unitPrice1 ?? 0) - (b.unitPrice1 ?? 0));
    } else if (sortOption === 'priceHigh') {
      filtered.sort((a, b) => (b.unitPrice1 ?? 0) - (a.unitPrice1 ?? 0));
    } else if (sortOption === 'ratingHigh') {
      filtered.sort((a, b) => {
        const aRating = a.totalNumberOfUserRating > 0 ? (a.totalRating / a.totalNumberOfUserRating) : 0;
        const bRating = b.totalNumberOfUserRating > 0 ? (b.totalRating / b.totalNumberOfUserRating) : 0;
        return bRating - aRating;
      });
    } else if (sortOption === 'popular') {
      filtered.sort((a, b) => (b.totalNumberOfUserRating ?? 0) - (a.totalNumberOfUserRating ?? 0));
    }

    return filtered;
  }, [query, favorites, sortOption]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center" aria-live="polite" aria-busy="true">
        <LoadingSpinner />
      </div>
    );
  }

  // Unauthenticated State
  if (!firebaseUser) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-[#2D1508] flex flex-col pt-4 sm:pt-6 pb-20 sm:pb-28">
        <div className="max-w-[1360px] mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col gap-6 sm:gap-8">
          
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#8A796F] font-medium">
            <Link href="/" className="hover:text-[#733617] transition-colors">Home</Link>
            <span className="text-[#B5A599]" aria-hidden="true">&gt;</span>
            <span className="text-[#733617] font-semibold" aria-current="page">My Favorites</span>
          </nav>

          <div className="bg-white border border-[#EFE6DC] rounded-2xl p-8 sm:p-12 flex flex-col items-center text-center shadow-xs max-w-lg mx-auto w-full">
            <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center text-[#733617] mb-4 shadow-xs">
              <Heart size={28} className="fill-[#733617]/20" aria-hidden="true" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1508] mb-2">
              Sign In to View Your Favorites
            </h1>
            <p className="text-xs sm:text-sm text-[#65544A] max-w-sm mb-6 leading-relaxed">
              Log in to see your handpicked authentic Gujarati sweets, farsan, and snacks ready to order anytime.
            </p>
            <Link
              href="/login?redirect=/favorites"
              className="inline-flex items-center gap-2 bg-[#733617] hover:bg-[#5A290F] text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-xs focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:outline-hidden"
            >
              <span>Sign In with Phone or Email</span>
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D1508] flex flex-col pt-4 sm:pt-6 pb-20 sm:pb-28">
      <div className="max-w-[1360px] mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col gap-6 sm:gap-8">
        
        {/* ── 1. Breadcrumbs ── */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#8A796F] font-medium">
          <Link 
            href="/" 
            className="hover:text-[#733617] focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:outline-hidden rounded-xs transition-colors"
          >
            Home
          </Link>
          <span className="text-[#B5A599]" aria-hidden="true">&gt;</span>
          <Link 
            href="/profile" 
            className="hover:text-[#733617] focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:outline-hidden rounded-xs transition-colors"
          >
            My Account
          </Link>
          <span className="text-[#B5A599]" aria-hidden="true">&gt;</span>
          <span className="text-[#733617] font-semibold" aria-current="page">My Favorites</span>
        </nav>

        {/* ── 2. Top Header Banner Card ── */}
        <header className="relative w-full overflow-hidden bg-white border border-[#EFE6DC] rounded-2xl p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
            
            <div className="flex items-start sm:items-center gap-4">
              <Link
                href="/profile"
                aria-label="Back to My Account"
                className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center hover:bg-white text-[#733617] transition-all shadow-xs shrink-0 focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:outline-hidden"
              >
                <ArrowLeft size={18} aria-hidden="true" />
              </Link>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] text-[10px] font-bold uppercase tracking-[0.15em] text-[#733617] mb-1.5">
                  <Sparkles size={11} className="text-[#C88A2C]" aria-hidden="true" />
                  <span>Falguni Parivar • પસંદગીના નાસ્તા</span>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1508] tracking-tight">
                  My Favorite Items
                </h1>
                <p className="text-xs sm:text-sm text-[#65544A] mt-1 leading-relaxed">
                  Your handpicked authentic Gujarati sweets, farsan, and snacks ready to order anytime.
                </p>
              </div>
            </div>

            {/* Saved Count Badge */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FAF7F2] border border-[#EFE6DC] text-xs font-bold text-[#733617] self-start sm:self-auto shrink-0">
              <Heart size={14} className="fill-[#733617]" aria-hidden="true" />
              <span>{favorites.length} Saved {favorites.length === 1 ? 'Item' : 'Items'}</span>
            </div>

          </div>
        </header>

        {/* ── Screen Reader Announcement Live Region ── */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {announcement}
        </div>

        {/* ── Toolbar: Search & Sort ── */}
        {favorites.length > 0 && (
          <div className="bg-white border border-[#EFE6DC] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <label htmlFor="favorites-search" className="sr-only">
                Search in favorites
              </label>
              <input
                id="favorites-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your saved snacks & sweets..."
                className="w-full text-xs sm:text-sm text-[#2D1508] bg-[#FAF7F2] border border-[#EFE6DC] focus:border-[#733617] focus:bg-white rounded-xl py-2.5 pl-10 pr-9 outline-hidden transition-all placeholder:text-[#2D1508]/40 focus-visible:ring-2 focus-visible:ring-[#733617]"
              />
              <Search 
                size={16} 
                className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#733617]" 
                aria-hidden="true" 
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search text"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A796F] hover:text-[#2D1508] p-1"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Sort Filter Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A796F] flex items-center gap-1.5 mr-1">
                <SlidersHorizontal size={13} className="text-[#733617]" aria-hidden="true" />
                <span>Sort:</span>
              </span>

              {[
                { id: 'popular', label: 'Popular' },
                { id: 'ratingHigh', label: 'Highest Rated' },
                { id: 'priceLow', label: 'Price: Low' },
                { id: 'priceHigh', label: 'Price: High' },
              ].map((tab) => {
                const isActive = sortOption === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSortOption(tab.id as any)}
                    aria-pressed={isActive}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:outline-hidden ${
                      isActive 
                        ? 'bg-[#733617] text-white shadow-xs' 
                        : 'bg-[#FAF7F2] text-[#65544A] hover:bg-[#EFE6DC] hover:text-[#2D1508]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

          </div>
        )}

        {/* ── Main Content Area ── */}
        <main>
          {favorites.length === 0 ? (
            /* Empty Favorites List */
            <div 
              role="region" 
              aria-label="No favorites"
              className="bg-white border border-[#EFE6DC] rounded-2xl p-8 sm:p-14 flex flex-col items-center text-center shadow-xs"
            >
              <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center text-[#733617] mb-4 shadow-xs">
                <Heart size={28} className="fill-[#733617]/20" aria-hidden="true" />
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2D1508] mb-2">
                Your Favorites List is Empty
              </h2>
              <p className="text-xs sm:text-sm text-[#65544A] max-w-md mb-6 leading-relaxed">
                You haven't saved any items yet. Tap the heart icon on any sweets, farsan, or snacks while browsing to re-order them anytime.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-[#733617] hover:bg-[#5A290F] text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-xs focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:outline-hidden"
              >
                <span>Explore All Products</span>
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          ) : filteredResults.length > 0 ? (
            /* Product Cards Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredResults.map((product) => (
                <FavoriteProductCard
                  key={product.uid ?? product.productID}
                  product={product}
                  userId={firebaseUser.uid}
                  onAnnounce={handleAnnounce}
                />
              ))}
            </div>
          ) : (
            /* No Search Match */
            <div 
              role="region" 
              aria-label="No search results"
              className="bg-white border border-[#EFE6DC] rounded-2xl p-8 sm:p-12 flex flex-col items-center text-center shadow-xs"
            >
              <div className="w-14 h-14 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center text-[#733617] mb-3">
                <Search size={22} aria-hidden="true" />
              </div>
              <h2 className="font-serif text-xl font-bold text-[#2D1508] mb-1">
                No matching favorites found
              </h2>
              <p className="text-xs text-[#65544A] mb-5">
                No saved items match "{query}". Try checking for spelling or clear your search.
              </p>
              <button
                type="button"
                onClick={() => setQuery('')}
                className="px-5 py-2 rounded-xl bg-[#FAF7F2] border border-[#EFE6DC] hover:bg-white text-[#733617] text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:outline-hidden"
              >
                Clear Search
              </button>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
